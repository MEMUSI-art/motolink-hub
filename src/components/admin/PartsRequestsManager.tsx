import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { Search, Phone, MessageCircle, Package, Clock, AlertTriangle, Check, DollarSign } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

const statusColors: Record<string, string> = {
  pending: 'bg-warning',
  sourcing: 'bg-accent',
  quoted: 'bg-primary',
  ordered: 'bg-success/80',
  delivered: 'bg-success',
  cancelled: 'bg-destructive',
};

const urgencyColors: Record<string, string> = {
  low: 'bg-muted',
  normal: 'bg-primary/50',
  high: 'bg-warning',
  urgent: 'bg-destructive',
};

export default function PartsRequestsManager() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [quotedPrice, setQuotedPrice] = useState('');
  const [supplierNotes, setSupplierNotes] = useState('');

  const { data: requests, isLoading } = useQuery({
    queryKey: ['admin-parts-requests', statusFilter],
    queryFn: async () => {
      let query = supabase
        .from('parts_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: any }) => {
      const { error } = await supabase
        .from('parts_requests')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-parts-requests'] });
      toast.success('Request updated successfully');
      setSelectedRequest(null);
    },
    onError: () => {
      toast.error('Failed to update request');
    },
  });

  const handleStatusUpdate = (id: string, status: string) => {
    const updates: any = { status };
    if (status === 'quoted') {
      updates.quoted_price = parseFloat(quotedPrice) || null;
      updates.supplier_notes = supplierNotes;
    }
    updateMutation.mutate({ id, updates });
  };

  const filteredRequests = requests?.filter(req =>
    req.part_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    req.bike_make.toLowerCase().includes(searchQuery.toLowerCase()) ||
    req.contact_phone.includes(searchQuery)
  );

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const stats = {
    pending: requests?.filter(r => r.status === 'pending').length || 0,
    sourcing: requests?.filter(r => r.status === 'sourcing').length || 0,
    quoted: requests?.filter(r => r.status === 'quoted').length || 0,
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-display text-warning">{stats.pending}</p>
            <p className="text-sm text-muted-foreground">Pending</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-display text-accent">{stats.sourcing}</p>
            <p className="text-sm text-muted-foreground">Sourcing</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-display text-primary">{stats.quoted}</p>
            <p className="text-sm text-muted-foreground">Awaiting Response</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by part, bike, or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="sourcing">Sourcing</SelectItem>
            <SelectItem value="quoted">Quoted</SelectItem>
            <SelectItem value="ordered">Ordered</SelectItem>
            <SelectItem value="delivered">Delivered</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Part</TableHead>
                <TableHead>Bike</TableHead>
                <TableHead>Qty</TableHead>
                <TableHead>Urgency</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">Loading...</TableCell>
                </TableRow>
              ) : filteredRequests?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    No requests found
                  </TableCell>
                </TableRow>
              ) : (
                filteredRequests?.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{request.part_name}</p>
                        {request.part_number && (
                          <p className="text-xs text-muted-foreground">{request.part_number}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p>{request.bike_make} {request.bike_model}</p>
                        {request.bike_year && (
                          <p className="text-xs text-muted-foreground">{request.bike_year}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{request.quantity}</TableCell>
                    <TableCell>
                      <Badge className={`${urgencyColors[request.urgency]} text-white`}>
                        {request.urgency}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <a href={`tel:${request.contact_phone}`} className="text-primary hover:underline">
                        {request.contact_phone}
                      </a>
                    </TableCell>
                    <TableCell>
                      <Badge className={`${statusColors[request.status]} text-white`}>
                        {request.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {format(new Date(request.created_at), 'MMM d')}
                    </TableCell>
                    <TableCell>
                      <Button size="sm" variant="outline" onClick={() => {
                        setSelectedRequest(request);
                        setQuotedPrice(request.quoted_price?.toString() || '');
                        setSupplierNotes(request.supplier_notes || '');
                      }}>
                        Manage
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={!!selectedRequest} onOpenChange={() => setSelectedRequest(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Parts Request</DialogTitle>
          </DialogHeader>
          
          {selectedRequest && (
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <p className="font-medium">{selectedRequest.part_name}</p>
                <p className="text-sm text-muted-foreground">
                  {selectedRequest.bike_make} {selectedRequest.bike_model} {selectedRequest.bike_year}
                </p>
                <p className="text-sm">Qty: {selectedRequest.quantity}</p>
              </div>

              {selectedRequest.description && (
                <div>
                  <Label>Details</Label>
                  <p className="text-sm text-muted-foreground">{selectedRequest.description}</p>
                </div>
              )}

              {selectedRequest.images?.length > 0 && (
                <div className="grid grid-cols-2 gap-2">
                  {selectedRequest.images.map((img: string, i: number) => (
                    <img key={i} src={img} alt="" className="rounded-lg aspect-square object-cover" />
                  ))}
                </div>
              )}

              <div>
                <Label htmlFor="quoted_price">Quoted Price (KES)</Label>
                <Input
                  id="quoted_price"
                  type="number"
                  value={quotedPrice}
                  onChange={(e) => setQuotedPrice(e.target.value)}
                  placeholder="Enter quote amount"
                />
              </div>

              <div>
                <Label htmlFor="supplier_notes">Supplier Notes</Label>
                <Textarea
                  id="supplier_notes"
                  value={supplierNotes}
                  onChange={(e) => setSupplierNotes(e.target.value)}
                  placeholder="Availability, lead time, etc."
                  rows={3}
                />
              </div>

              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => window.open(`tel:${selectedRequest.contact_phone}`)}>
                  <Phone className="w-4 h-4" />
                  Call
                </Button>
                <Button variant="outline" className="flex-1" onClick={() => window.open(`https://wa.me/${selectedRequest.contact_phone}`)}>
                  <MessageCircle className="w-4 h-4" />
                  WhatsApp
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {selectedRequest.status === 'pending' && (
                  <Button variant="outline" onClick={() => handleStatusUpdate(selectedRequest.id, 'sourcing')}>
                    Start Sourcing
                  </Button>
                )}
                {(selectedRequest.status === 'pending' || selectedRequest.status === 'sourcing') && (
                  <Button variant="hero" onClick={() => handleStatusUpdate(selectedRequest.id, 'quoted')}>
                    <DollarSign className="w-4 h-4" />
                    Send Quote
                  </Button>
                )}
                {selectedRequest.status === 'quoted' && (
                  <Button variant="hero" onClick={() => handleStatusUpdate(selectedRequest.id, 'ordered')}>
                    <Package className="w-4 h-4" />
                    Mark Ordered
                  </Button>
                )}
                {selectedRequest.status === 'ordered' && (
                  <Button variant="hero" onClick={() => handleStatusUpdate(selectedRequest.id, 'delivered')}>
                    <Check className="w-4 h-4" />
                    Mark Delivered
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}