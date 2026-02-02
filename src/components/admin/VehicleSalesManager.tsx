import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { Search, Phone, Mail, MessageCircle, Eye, Check, X, Car, Bike, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const statusColors: Record<string, string> = {
  pending: 'bg-warning',
  approved: 'bg-success',
  rejected: 'bg-destructive',
  sold: 'bg-muted',
  archived: 'bg-muted',
};

export default function VehicleSalesManager() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedListing, setSelectedListing] = useState<any>(null);
  const [adminNotes, setAdminNotes] = useState('');

  const { data: listings, isLoading } = useQuery({
    queryKey: ['admin-vehicle-sales', statusFilter],
    queryFn: async () => {
      let query = supabase
        .from('vehicle_sales')
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
        .from('vehicle_sales')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-vehicle-sales'] });
      toast.success('Listing updated successfully');
      setSelectedListing(null);
    },
    onError: () => {
      toast.error('Failed to update listing');
    },
  });

  const handleApprove = (id: string) => {
    updateMutation.mutate({ id, updates: { status: 'approved', admin_notes: adminNotes } });
  };

  const handleReject = (id: string) => {
    updateMutation.mutate({ id, updates: { status: 'rejected', admin_notes: adminNotes } });
  };

  const filteredListings = listings?.filter(listing =>
    listing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    listing.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
    listing.contact_phone.includes(searchQuery)
  );

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const stats = {
    pending: listings?.filter(l => l.status === 'pending').length || 0,
    approved: listings?.filter(l => l.status === 'approved').length || 0,
    sold: listings?.filter(l => l.status === 'sold').length || 0,
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-display text-warning">{stats.pending}</p>
            <p className="text-sm text-muted-foreground">Pending Review</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-display text-success">{stats.approved}</p>
            <p className="text-sm text-muted-foreground">Active Listings</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-display text-primary">{stats.sold}</p>
            <p className="text-sm text-muted-foreground">Sold</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by title, brand, or phone..."
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
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
            <SelectItem value="sold">Sold</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Vehicle</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">Loading...</TableCell>
                </TableRow>
              ) : filteredListings?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No listings found
                  </TableCell>
                </TableRow>
              ) : (
                filteredListings?.map((listing) => (
                  <TableRow key={listing.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center overflow-hidden">
                          {listing.images?.[0] ? (
                            <img src={listing.images[0]} alt="" className="w-full h-full object-cover" />
                          ) : listing.vehicle_type === 'buggy' || listing.vehicle_type === 'atv' ? (
                            <Car className="w-6 h-6 text-muted-foreground" />
                          ) : (
                            <Bike className="w-6 h-6 text-muted-foreground" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium line-clamp-1">{listing.title}</p>
                          <p className="text-sm text-muted-foreground">{listing.brand} {listing.model}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium text-primary">
                      {formatPrice(listing.price)}
                    </TableCell>
                    <TableCell>{listing.location}</TableCell>
                    <TableCell>
                      <a href={`tel:${listing.contact_phone}`} className="text-primary hover:underline">
                        {listing.contact_phone}
                      </a>
                    </TableCell>
                    <TableCell>
                      <Badge className={`${statusColors[listing.status]} text-white`}>
                        {listing.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {format(new Date(listing.created_at), 'MMM d')}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => setSelectedListing(listing)}>
                          <Eye className="w-4 h-4" />
                        </Button>
                        {listing.status === 'pending' && (
                          <>
                            <Button size="sm" variant="outline" className="text-success" onClick={() => handleApprove(listing.id)}>
                              <Check className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="outline" className="text-destructive" onClick={() => handleReject(listing.id)}>
                              <X className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={!!selectedListing} onOpenChange={() => setSelectedListing(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Vehicle Listing Details</DialogTitle>
          </DialogHeader>
          
          {selectedListing && (
            <div className="space-y-6">
              {/* Images */}
              {selectedListing.images?.length > 0 && (
                <div className="grid grid-cols-3 gap-2">
                  {selectedListing.images.map((img: string, i: number) => (
                    <img key={i} src={img} alt="" className="rounded-lg aspect-video object-cover" />
                  ))}
                </div>
              )}

              {/* Details */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="text-muted-foreground">Type:</span> {selectedListing.vehicle_type}</div>
                <div><span className="text-muted-foreground">Condition:</span> {selectedListing.condition}</div>
                <div><span className="text-muted-foreground">Year:</span> {selectedListing.year || 'N/A'}</div>
                <div><span className="text-muted-foreground">Mileage:</span> {selectedListing.mileage?.toLocaleString() || 'N/A'} km</div>
                <div><span className="text-muted-foreground">Engine:</span> {selectedListing.engine || 'N/A'}</div>
                <div><span className="text-muted-foreground">Power:</span> {selectedListing.power || 'N/A'}</div>
              </div>

              {selectedListing.description && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Description:</p>
                  <p className="text-sm">{selectedListing.description}</p>
                </div>
              )}

              {/* Admin Notes */}
              <div>
                <p className="text-sm font-medium mb-2">Admin Notes:</p>
                <Textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Add notes for the seller..."
                  rows={3}
                />
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => window.open(`tel:${selectedListing.contact_phone}`)}>
                  <Phone className="w-4 h-4" />
                  Call
                </Button>
                <Button variant="outline" className="flex-1" onClick={() => window.open(`https://wa.me/${selectedListing.contact_phone}`)}>
                  <MessageCircle className="w-4 h-4" />
                  WhatsApp
                </Button>
                {selectedListing.status === 'pending' && (
                  <>
                    <Button variant="hero" className="flex-1" onClick={() => handleApprove(selectedListing.id)}>
                      Approve
                    </Button>
                    <Button variant="destructive" className="flex-1" onClick={() => handleReject(selectedListing.id)}>
                      Reject
                    </Button>
                  </>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}