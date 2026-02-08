import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Building2, Loader2, Phone, Mail, MapPin, Calendar, Users, Wrench, Search, Shield, Truck, DollarSign } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface FleetRequest {
  id: string;
  organization_name: string;
  contact_person: string;
  contact_email: string | null;
  contact_phone: string;
  fleet_size: number | null;
  service_type: string;
  vehicle_details: string | null;
  description: string | null;
  preferred_date: string | null;
  urgency: string | null;
  location: string;
  status: string;
  admin_notes: string | null;
  quoted_price: number | null;
  created_at: string;
}

const statusColors: Record<string, string> = {
  pending: 'bg-accent text-accent-foreground',
  reviewed: 'bg-primary text-primary-foreground',
  quoted: 'bg-success text-success-foreground',
  'in-progress': 'bg-primary text-primary-foreground',
  completed: 'bg-muted text-muted-foreground',
  cancelled: 'bg-destructive text-destructive-foreground',
};

const serviceLabels: Record<string, string> = {
  maintenance: 'Fleet Maintenance',
  'pre-purchase': 'Pre-Purchase Inspection',
  inspection: 'Fleet Inspection',
  'fleet-setup': 'Fleet Setup & Consulting',
};

const serviceIcons: Record<string, typeof Wrench> = {
  maintenance: Wrench,
  'pre-purchase': Search,
  inspection: Shield,
  'fleet-setup': Truck,
};

const urgencyColors: Record<string, string> = {
  low: 'bg-muted text-muted-foreground',
  normal: 'bg-secondary text-secondary-foreground',
  high: 'bg-accent text-accent-foreground',
  urgent: 'bg-destructive text-destructive-foreground',
};

export default function FleetRequestsManager() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedRequest, setSelectedRequest] = useState<FleetRequest | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [quotedPrice, setQuotedPrice] = useState('');

  const { data: requests, isLoading } = useQuery({
    queryKey: ['fleet-service-requests'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('fleet_service_requests')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as FleetRequest[];
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Record<string, any> }) => {
      const { error } = await supabase
        .from('fleet_service_requests')
        .update(updates)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fleet-service-requests'] });
      toast.success('Request updated');
      setSelectedRequest(null);
    },
    onError: () => toast.error('Failed to update request'),
  });

  const handleUpdateRequest = (status: string) => {
    if (!selectedRequest) return;
    updateMutation.mutate({
      id: selectedRequest.id,
      updates: {
        status,
        admin_notes: adminNotes || null,
        quoted_price: quotedPrice ? parseFloat(quotedPrice) : null,
      },
    });
  };

  const handleQuickStatus = (id: string, status: string) => {
    updateMutation.mutate({ id, updates: { status } });
  };

  const openDetails = (req: FleetRequest) => {
    setSelectedRequest(req);
    setAdminNotes(req.admin_notes || '');
    setQuotedPrice(req.quoted_price?.toString() || '');
  };

  const filtered = requests?.filter(r => statusFilter === 'all' || r.status === statusFilter) || [];
  const pendingCount = requests?.filter(r => r.status === 'pending').length || 0;

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-3">
            <CardTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-primary" />
              Fleet Service Requests ({requests?.length || 0})
              {pendingCount > 0 && <Badge className="bg-accent text-accent-foreground">{pendingCount} pending</Badge>}
            </CardTitle>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="reviewed">Reviewed</SelectItem>
                <SelectItem value="quoted">Quoted</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : filtered.length === 0 ? (
            <p className="text-muted-foreground text-center py-12">No fleet service requests found</p>
          ) : (
            <div className="space-y-3">
              {filtered.map((req) => {
                const Icon = serviceIcons[req.service_type] || Building2;
                return (
                  <div
                    key={req.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-muted/30 rounded-lg border border-border/50 cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => openDetails(req)}
                  >
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className="p-2 rounded-lg bg-primary/10 shrink-0">
                        <Icon className="w-5 h-5 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-semibold">{req.organization_name}</p>
                          <Badge className={statusColors[req.status] || 'bg-secondary text-secondary-foreground'}>{req.status}</Badge>
                          {req.urgency && req.urgency !== 'normal' && (
                            <Badge className={urgencyColors[req.urgency]}>{req.urgency}</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {serviceLabels[req.service_type] || req.service_type} • {req.contact_person} • {req.fleet_size || 1} vehicle{(req.fleet_size || 1) > 1 ? 's' : ''}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          <MapPin className="w-3 h-3 inline" /> {req.location} • {format(new Date(req.created_at), 'MMM d, yyyy')}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      {req.quoted_price && (
                        <Badge variant="outline" className="font-mono">KES {req.quoted_price.toLocaleString()}</Badge>
                      )}
                      {req.status === 'pending' && (
                        <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); handleQuickStatus(req.id, 'reviewed'); }}>
                          Mark Reviewed
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detail / Quote Dialog */}
      <Dialog open={!!selectedRequest} onOpenChange={(open) => !open && setSelectedRequest(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-primary" />
              {selectedRequest?.organization_name}
            </DialogTitle>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <span>{selectedRequest.contact_person}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <a href={`tel:${selectedRequest.contact_phone}`} className="text-primary underline">{selectedRequest.contact_phone}</a>
                </div>
                {selectedRequest.contact_email && (
                  <div className="flex items-center gap-2 col-span-2">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <a href={`mailto:${selectedRequest.contact_email}`} className="text-primary underline">{selectedRequest.contact_email}</a>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span>{selectedRequest.location}</span>
                </div>
                {selectedRequest.preferred_date && (
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span>{format(new Date(selectedRequest.preferred_date), 'MMM d, yyyy')}</span>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                <Badge className={statusColors[selectedRequest.status]}>{selectedRequest.status}</Badge>
                <Badge variant="outline">{serviceLabels[selectedRequest.service_type]}</Badge>
                <Badge variant="outline">{selectedRequest.fleet_size || 1} vehicle(s)</Badge>
                {selectedRequest.urgency && <Badge className={urgencyColors[selectedRequest.urgency]}>{selectedRequest.urgency}</Badge>}
              </div>

              {selectedRequest.vehicle_details && (
                <div>
                  <Label className="text-xs text-muted-foreground">Vehicle Details</Label>
                  <p className="text-sm">{selectedRequest.vehicle_details}</p>
                </div>
              )}

              {selectedRequest.description && (
                <div>
                  <Label className="text-xs text-muted-foreground">Description</Label>
                  <p className="text-sm">{selectedRequest.description}</p>
                </div>
              )}

              <div className="border-t border-border pt-4 space-y-3">
                <div>
                  <Label htmlFor="quote">Quote (KES)</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <DollarSign className="w-4 h-4 text-muted-foreground" />
                    <Input id="quote" type="number" placeholder="e.g. 15000" value={quotedPrice} onChange={e => setQuotedPrice(e.target.value)} />
                  </div>
                </div>
                <div>
                  <Label htmlFor="notes">Admin Notes</Label>
                  <Textarea id="notes" placeholder="Internal notes about this request..." value={adminNotes} onChange={e => setAdminNotes(e.target.value)} rows={3} className="mt-1" />
                </div>
              </div>

              <div className="flex flex-wrap gap-2 pt-2">
                <Button size="sm" onClick={() => handleUpdateRequest('reviewed')} disabled={updateMutation.isPending}>Reviewed</Button>
                <Button size="sm" variant="default" onClick={() => handleUpdateRequest('quoted')} disabled={updateMutation.isPending || !quotedPrice}>
                  <DollarSign className="w-4 h-4" /> Send Quote
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleUpdateRequest('in-progress')} disabled={updateMutation.isPending}>In Progress</Button>
                <Button size="sm" variant="outline" onClick={() => handleUpdateRequest('completed')} disabled={updateMutation.isPending}>Complete</Button>
                <Button size="sm" variant="destructive" onClick={() => handleUpdateRequest('cancelled')} disabled={updateMutation.isPending}>Cancel</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
