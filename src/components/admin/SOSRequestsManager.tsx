import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertTriangle, Phone, MapPin, Clock, CheckCircle, Loader2, ExternalLink, User, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';
import { format, formatDistanceToNow } from 'date-fns';

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
  resolved_at: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

const MOTOLINK_WHATSAPP = "254707931926";

const getStatusColor = (status: string) => {
  switch (status) {
    case 'pending': return 'bg-destructive text-destructive-foreground animate-pulse';
    case 'dispatched': return 'bg-accent text-accent-foreground';
    case 'in_progress': return 'bg-primary text-primary-foreground';
    case 'resolved': return 'bg-success text-success-foreground';
    case 'cancelled': return 'bg-muted text-muted-foreground';
    default: return 'bg-secondary text-secondary-foreground';
  }
};

const getEmergencyTypeLabel = (type: string) => {
  const labels: Record<string, string> = {
    'breakdown': '🔧 Breakdown',
    'accident': '🚨 Accident',
    'flat-tire': '🛞 Flat Tire',
    'no-fuel': '⛽ Out of Fuel',
    'other': '❓ Other',
  };
  return labels[type] || type;
};

export default function SOSRequestsManager() {
  const [sosRequests, setSosRequests] = useState<SOSRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<SOSRequest | null>(null);
  const [notes, setNotes] = useState('');
  const [assignee, setAssignee] = useState('');

  const fetchSOSRequests = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('sos_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSosRequests(data || []);
    } catch (error) {
      console.error('Failed to fetch SOS requests:', error);
      toast.error('Failed to load SOS requests');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSOSRequests();

    // Realtime subscription for SOS requests
    const channel = supabase
      .channel('admin-sos')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'sos_requests' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setSosRequests(prev => [payload.new as SOSRequest, ...prev]);
          toast.error('🆘 NEW SOS REQUEST!', { 
            description: `${(payload.new as SOSRequest).name} needs help!`,
            duration: 10000 
          });
        } else if (payload.eventType === 'UPDATE') {
          setSosRequests(prev => prev.map(r => r.id === payload.new.id ? payload.new as SOSRequest : r));
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const updateSOSStatus = async (id: string, status: string, additionalData?: Partial<SOSRequest>) => {
    setUpdatingId(id);
    try {
      const updateData: Record<string, unknown> = { status, ...additionalData };
      if (status === 'resolved') {
        updateData.resolved_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('sos_requests')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;
      toast.success(`SOS request ${status}`);
      setSelectedRequest(null);
    } catch (error) {
      toast.error('Failed to update SOS request');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleContactWhatsApp = (request: SOSRequest) => {
    const message = encodeURIComponent(
      `Hi ${request.name}, this is MotoLink Emergency Response. We received your SOS request for "${request.emergency_type}". Help is on the way! Your location: ${request.location}`
    );
    window.open(`https://wa.me/${request.phone.replace(/\D/g, '')}?text=${message}`, '_blank');
  };

  const handleCall = (phone: string) => {
    window.location.href = `tel:${phone}`;
  };

  const openGoogleMaps = (lat: number, lng: number) => {
    window.open(`https://maps.google.com/?q=${lat},${lng}`, '_blank');
  };

  const pendingCount = sosRequests.filter(r => r.status === 'pending').length;
  const activeCount = sosRequests.filter(r => ['dispatched', 'in_progress'].includes(r.status)).length;

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6 flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className={pendingCount > 0 ? 'border-destructive bg-destructive/10' : ''}>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className={`w-8 h-8 ${pendingCount > 0 ? 'text-destructive animate-pulse' : 'text-muted-foreground'}`} />
              <div>
                <p className="text-2xl font-bold">{pendingCount}</p>
                <p className="text-sm text-muted-foreground">Pending</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <Clock className="w-8 h-8 text-accent" />
              <div>
                <p className="text-2xl font-bold">{activeCount}</p>
                <p className="text-sm text-muted-foreground">Active</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-8 h-8 text-success" />
              <div>
                <p className="text-2xl font-bold">{sosRequests.filter(r => r.status === 'resolved').length}</p>
                <p className="text-sm text-muted-foreground">Resolved</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-8 h-8 text-muted-foreground" />
              <div>
                <p className="text-2xl font-bold">{sosRequests.length}</p>
                <p className="text-sm text-muted-foreground">Total</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* SOS Requests List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-destructive" />
            SOS Requests
          </CardTitle>
        </CardHeader>
        <CardContent>
          {sosRequests.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <AlertTriangle className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No SOS requests yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {sosRequests.map((request) => (
                <div 
                  key={request.id} 
                  className={`p-4 rounded-lg border ${request.status === 'pending' ? 'border-destructive bg-destructive/5' : 'border-border bg-muted/30'}`}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-3 flex-wrap">
                        <Badge className={getStatusColor(request.status)}>
                          {request.status.toUpperCase()}
                        </Badge>
                        <span className="font-medium">{getEmergencyTypeLabel(request.emergency_type)}</span>
                        <span className="text-sm text-muted-foreground">
                          {formatDistanceToNow(new Date(request.created_at), { addSuffix: true })}
                        </span>
                      </div>

                      <div className="flex items-center gap-4 text-sm">
                        <span className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          {request.name}
                        </span>
                        <span className="flex items-center gap-1">
                          <Phone className="w-4 h-4" />
                          {request.phone}
                        </span>
                      </div>

                      <div className="flex items-start gap-1 text-sm">
                        <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <span className="text-muted-foreground">{request.location}</span>
                        {request.latitude && request.longitude && (
                          <Button 
                            variant="link" 
                            size="sm" 
                            className="p-0 h-auto text-primary"
                            onClick={() => openGoogleMaps(request.latitude!, request.longitude!)}
                          >
                            <ExternalLink className="w-3 h-3 ml-1" />
                          </Button>
                        )}
                      </div>

                      {request.description && (
                        <p className="text-sm text-muted-foreground italic">"{request.description}"</p>
                      )}

                      {request.assigned_to && (
                        <p className="text-sm">
                          <span className="text-muted-foreground">Assigned to:</span> {request.assigned_to}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Button size="sm" variant="outline" onClick={() => handleCall(request.phone)}>
                        <Phone className="w-4 h-4" />
                        Call
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleContactWhatsApp(request)}>
                        <MessageSquare className="w-4 h-4" />
                        WhatsApp
                      </Button>

                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            size="sm" 
                            variant={request.status === 'pending' ? 'default' : 'secondary'}
                            onClick={() => {
                              setSelectedRequest(request);
                              setNotes(request.notes || '');
                              setAssignee(request.assigned_to || '');
                            }}
                          >
                            Manage
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Manage SOS Request</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4 pt-4">
                            <div>
                              <label className="text-sm font-medium block mb-2">Status</label>
                              <Select 
                                value={request.status} 
                                onValueChange={(value) => updateSOSStatus(request.id, value)}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="pending">Pending</SelectItem>
                                  <SelectItem value="dispatched">Dispatched</SelectItem>
                                  <SelectItem value="in_progress">In Progress</SelectItem>
                                  <SelectItem value="resolved">Resolved</SelectItem>
                                  <SelectItem value="cancelled">Cancelled</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            <div>
                              <label className="text-sm font-medium block mb-2">Assign To</label>
                              <Input 
                                value={assignee}
                                onChange={(e) => setAssignee(e.target.value)}
                                placeholder="Responder name"
                              />
                            </div>

                            <div>
                              <label className="text-sm font-medium block mb-2">Notes</label>
                              <Textarea 
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Add internal notes..."
                                rows={3}
                              />
                            </div>

                            <div className="flex gap-2">
                              <Button 
                                onClick={() => updateSOSStatus(request.id, request.status, { 
                                  notes, 
                                  assigned_to: assignee || null 
                                })}
                                disabled={updatingId === request.id}
                                className="flex-1"
                              >
                                {updatingId === request.id && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                Save Changes
                              </Button>
                              {request.status !== 'resolved' && (
                                <Button 
                                  variant="outline"
                                  onClick={() => updateSOSStatus(request.id, 'resolved', { 
                                    notes, 
                                    assigned_to: assignee || null 
                                  })}
                                  disabled={updatingId === request.id}
                                >
                                  <CheckCircle className="w-4 h-4 mr-2" />
                                  Resolve
                                </Button>
                              )}
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
