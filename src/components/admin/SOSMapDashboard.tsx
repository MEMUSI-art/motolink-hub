import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, MapPin, Phone, ExternalLink, RefreshCw, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

interface SOSRequest {
  id: string;
  user_id: string | null;
  emergency_type: string;
  name: string;
  phone: string;
  location: string;
  latitude: number | null;
  longitude: number | null;
  description: string | null;
  status: string;
  assigned_to: string | null;
  created_at: string;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'pending': return 'bg-destructive text-destructive-foreground';
    case 'dispatched': return 'bg-accent text-accent-foreground';
    case 'in_progress': return 'bg-primary text-primary-foreground';
    default: return 'bg-muted text-muted-foreground';
  }
};

const getEmergencyIcon = (type: string) => {
  const icons: Record<string, string> = {
    'breakdown': '🔧',
    'accident': '🚨',
    'flat-tire': '🛞',
    'no-fuel': '⛽',
    'other': '❓',
  };
  return icons[type] || '❓';
};

export default function SOSMapDashboard() {
  const [activeRequests, setActiveRequests] = useState<SOSRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<SOSRequest | null>(null);

  const fetchActiveRequests = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('sos_requests')
        .select('*')
        .in('status', ['pending', 'dispatched', 'in_progress'])
        .order('created_at', { ascending: false });

      if (error) throw error;
      setActiveRequests(data || []);
    } catch (error) {
      console.error('Failed to fetch SOS requests:', error);
      toast.error('Failed to load SOS requests');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchActiveRequests();

    // Realtime subscription
    const channel = supabase
      .channel('sos-map')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'sos_requests' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          const newRequest = payload.new as SOSRequest;
          if (['pending', 'dispatched', 'in_progress'].includes(newRequest.status)) {
            setActiveRequests(prev => [newRequest, ...prev]);
            toast.error('🆘 NEW SOS!', { 
              description: `${newRequest.name} at ${newRequest.location}`,
              duration: 10000
            });
          }
        } else if (payload.eventType === 'UPDATE') {
          const updated = payload.new as SOSRequest;
          if (['pending', 'dispatched', 'in_progress'].includes(updated.status)) {
            setActiveRequests(prev => prev.map(r => r.id === updated.id ? updated : r));
          } else {
            setActiveRequests(prev => prev.filter(r => r.id !== updated.id));
          }
        } else if (payload.eventType === 'DELETE') {
          setActiveRequests(prev => prev.filter(r => r.id !== payload.old.id));
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const requestsWithLocation = activeRequests.filter(r => r.latitude && r.longitude);
  const pendingCount = activeRequests.filter(r => r.status === 'pending').length;

  // Generate OpenStreetMap embed URL with markers
  const getMapEmbedUrl = () => {
    if (requestsWithLocation.length === 0) {
      // Default to Nairobi, Kenya
      return 'https://www.openstreetmap.org/export/embed.html?bbox=36.7,-1.4,37.1,-1.2&layer=mapnik';
    }
    
    // Calculate bounds
    const lats = requestsWithLocation.map(r => r.latitude!);
    const lngs = requestsWithLocation.map(r => r.longitude!);
    const minLat = Math.min(...lats) - 0.05;
    const maxLat = Math.max(...lats) + 0.05;
    const minLng = Math.min(...lngs) - 0.05;
    const maxLng = Math.max(...lngs) + 0.05;
    
    return `https://www.openstreetmap.org/export/embed.html?bbox=${minLng},${minLat},${maxLng},${maxLat}&layer=mapnik`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <MapPin className="w-6 h-6 text-primary" />
          <h2 className="text-xl font-display">LIVE SOS MAP</h2>
          {pendingCount > 0 && (
            <Badge className="bg-destructive text-destructive-foreground animate-pulse">
              {pendingCount} PENDING
            </Badge>
          )}
        </div>
        <Button variant="outline" size="sm" onClick={fetchActiveRequests} disabled={isLoading}>
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Map View */}
        <Card className="lg:col-span-2">
          <CardContent className="p-0">
            <div className="relative w-full h-[500px] rounded-lg overflow-hidden">
              {isLoading ? (
                <div className="absolute inset-0 flex items-center justify-center bg-muted">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : (
                <>
                  <iframe
                    src={getMapEmbedUrl()}
                    className="w-full h-full border-0"
                    title="SOS Map"
                  />
                  
                  {/* Overlay markers */}
                  {requestsWithLocation.length > 0 && (
                    <div className="absolute bottom-4 left-4 right-4 bg-background/90 backdrop-blur-sm rounded-lg p-3 max-h-48 overflow-y-auto">
                      <p className="text-xs text-muted-foreground mb-2">
                        {requestsWithLocation.length} request(s) with GPS coordinates:
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        {requestsWithLocation.map(request => (
                          <Button
                            key={request.id}
                            variant={selectedRequest?.id === request.id ? 'default' : 'outline'}
                            size="sm"
                            className="justify-start text-xs"
                            onClick={() => {
                              setSelectedRequest(request);
                              window.open(
                                `https://maps.google.com/?q=${request.latitude},${request.longitude}`,
                                '_blank'
                              );
                            }}
                          >
                            <span className="mr-1">{getEmergencyIcon(request.emergency_type)}</span>
                            {request.name}
                            <ExternalLink className="w-3 h-3 ml-auto" />
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Active SOS List */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              Active Emergencies ({activeRequests.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="max-h-[450px] overflow-y-auto">
            {activeRequests.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <AlertTriangle className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>No active SOS requests</p>
              </div>
            ) : (
              <div className="space-y-3">
                {activeRequests.map(request => (
                  <div 
                    key={request.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-all ${
                      request.status === 'pending' 
                        ? 'border-destructive bg-destructive/10 hover:bg-destructive/20' 
                        : 'border-border bg-muted/30 hover:bg-muted/50'
                    } ${selectedRequest?.id === request.id ? 'ring-2 ring-primary' : ''}`}
                    onClick={() => setSelectedRequest(request)}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-lg">{getEmergencyIcon(request.emergency_type)}</span>
                          <span className="font-medium truncate">{request.name}</span>
                        </div>
                        <Badge className={`${getStatusColor(request.status)} text-xs`}>
                          {request.status.toUpperCase()}
                        </Badge>
                      </div>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {formatDistanceToNow(new Date(request.created_at), { addSuffix: true })}
                      </span>
                    </div>

                    <p className="text-sm text-muted-foreground mt-2 flex items-start gap-1">
                      <MapPin className="w-3 h-3 mt-1 flex-shrink-0" />
                      <span className="line-clamp-2">{request.location}</span>
                    </p>

                    <div className="flex items-center gap-2 mt-2">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="h-7 text-xs"
                        onClick={(e) => {
                          e.stopPropagation();
                          window.location.href = `tel:${request.phone}`;
                        }}
                      >
                        <Phone className="w-3 h-3" />
                        Call
                      </Button>
                      {request.latitude && request.longitude && (
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="h-7 text-xs"
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(
                              `https://maps.google.com/?q=${request.latitude},${request.longitude}`,
                              '_blank'
                            );
                          }}
                        >
                          <ExternalLink className="w-3 h-3" />
                          Maps
                        </Button>
                      )}
                    </div>

                    {request.assigned_to && (
                      <p className="text-xs text-muted-foreground mt-2">
                        Assigned: {request.assigned_to}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
