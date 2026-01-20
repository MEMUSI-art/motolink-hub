import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Bike, Phone, Mail, MapPin, Clock, CheckCircle, XCircle, Loader2, Eye, MessageSquare, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { format, formatDistanceToNow } from 'date-fns';

interface BikeListing {
  id: string;
  user_id: string;
  name: string;
  category: string;
  engine: string | null;
  power: string | null;
  description: string | null;
  price_per_day: number;
  location: string;
  images: string[];
  status: string;
  contact_phone: string;
  contact_email: string | null;
  notes: string | null;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
}

const MOTOLINK_WHATSAPP = "254707931926";

const getStatusColor = (status: string) => {
  switch (status) {
    case 'pending': return 'bg-accent text-accent-foreground';
    case 'approved': return 'bg-success text-success-foreground';
    case 'rejected': return 'bg-destructive text-destructive-foreground';
    case 'active': return 'bg-primary text-primary-foreground';
    default: return 'bg-muted text-muted-foreground';
  }
};

export default function BikeListingsManager() {
  const [listings, setListings] = useState<BikeListing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [selectedListing, setSelectedListing] = useState<BikeListing | null>(null);
  const [adminNotes, setAdminNotes] = useState('');

  const fetchListings = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('bike_listings')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setListings(data || []);
    } catch (error) {
      console.error('Failed to fetch listings:', error);
      toast.error('Failed to load bike listings');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();

    // Realtime subscription
    const channel = supabase
      .channel('admin-bike-listings')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bike_listings' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setListings(prev => [payload.new as BikeListing, ...prev]);
          toast.info('New bike listing submitted!', { 
            description: `${(payload.new as BikeListing).name}`
          });
        } else if (payload.eventType === 'UPDATE') {
          setListings(prev => prev.map(l => l.id === payload.new.id ? payload.new as BikeListing : l));
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const updateListingStatus = async (id: string, status: string, notes?: string) => {
    setUpdatingId(id);
    try {
      const updateData: Record<string, unknown> = { status };
      if (notes !== undefined) {
        updateData.admin_notes = notes;
      }

      const { error } = await supabase
        .from('bike_listings')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;
      toast.success(`Listing ${status}`);
      setSelectedListing(null);
    } catch (error) {
      toast.error('Failed to update listing');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleContactWhatsApp = (listing: BikeListing) => {
    const message = encodeURIComponent(
      `Hi! Regarding your bike listing "${listing.name}" on MotoLink Africa. We'd like to discuss your listing.`
    );
    window.open(`https://wa.me/${listing.contact_phone.replace(/\D/g, '')}?text=${message}`, '_blank');
  };

  const handleCall = (phone: string) => {
    window.location.href = `tel:${phone}`;
  };

  const pendingCount = listings.filter(l => l.status === 'pending').length;

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
        <Card className={pendingCount > 0 ? 'border-accent' : ''}>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <Clock className={`w-8 h-8 ${pendingCount > 0 ? 'text-accent' : 'text-muted-foreground'}`} />
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
              <CheckCircle className="w-8 h-8 text-success" />
              <div>
                <p className="text-2xl font-bold">{listings.filter(l => l.status === 'approved').length}</p>
                <p className="text-sm text-muted-foreground">Approved</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <Bike className="w-8 h-8 text-primary" />
              <div>
                <p className="text-2xl font-bold">{listings.filter(l => l.status === 'active').length}</p>
                <p className="text-sm text-muted-foreground">Active</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <Bike className="w-8 h-8 text-muted-foreground" />
              <div>
                <p className="text-2xl font-bold">{listings.length}</p>
                <p className="text-sm text-muted-foreground">Total</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Listings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bike className="w-5 h-5 text-primary" />
            Bike Listing Requests
          </CardTitle>
        </CardHeader>
        <CardContent>
          {listings.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Bike className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No bike listings yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {listings.map((listing) => (
                <div 
                  key={listing.id} 
                  className={`p-4 rounded-lg border ${
                    listing.status === 'pending' ? 'border-accent bg-accent/5' : 'border-border bg-muted/30'
                  }`}
                >
                  <div className="flex flex-col md:flex-row gap-4">
                    {/* Images */}
                    {listing.images && listing.images.length > 0 && (
                      <div className="flex gap-2 md:w-32 flex-shrink-0">
                        {listing.images.slice(0, 2).map((img, idx) => (
                          <img 
                            key={idx}
                            src={img} 
                            alt={listing.name}
                            className="w-14 h-14 object-cover rounded-lg border"
                          />
                        ))}
                        {listing.images.length > 2 && (
                          <div className="w-14 h-14 bg-muted rounded-lg flex items-center justify-center text-sm text-muted-foreground">
                            +{listing.images.length - 2}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Details */}
                    <div className="flex-1 space-y-2">
                      <div className="flex items-start justify-between gap-2 flex-wrap">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">{listing.name}</h3>
                            <Badge className={getStatusColor(listing.status)}>
                              {listing.status.toUpperCase()}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {listing.category} • {listing.engine || 'N/A'} • {listing.power || 'N/A'}
                          </p>
                        </div>
                        <p className="font-bold text-primary">
                          KES {listing.price_per_day.toLocaleString()}/day
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-4 text-sm">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-4 h-4 text-muted-foreground" />
                          {listing.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Phone className="w-4 h-4 text-muted-foreground" />
                          {listing.contact_phone}
                        </span>
                        {listing.contact_email && (
                          <span className="flex items-center gap-1">
                            <Mail className="w-4 h-4 text-muted-foreground" />
                            {listing.contact_email}
                          </span>
                        )}
                      </div>

                      {listing.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">{listing.description}</p>
                      )}

                      <p className="text-xs text-muted-foreground">
                        Submitted {formatDistanceToNow(new Date(listing.created_at), { addSuffix: true })}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap gap-2 md:flex-col md:w-auto">
                      <Button size="sm" variant="outline" onClick={() => handleCall(listing.contact_phone)}>
                        <Phone className="w-4 h-4" />
                        Call
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleContactWhatsApp(listing)}>
                        <MessageSquare className="w-4 h-4" />
                        WhatsApp
                      </Button>
                      
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            size="sm" 
                            variant={listing.status === 'pending' ? 'default' : 'secondary'}
                            onClick={() => {
                              setSelectedListing(listing);
                              setAdminNotes(listing.admin_notes || '');
                            }}
                          >
                            <Eye className="w-4 h-4" />
                            Review
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>Review Bike Listing</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4 pt-4">
                            {/* Images */}
                            {listing.images && listing.images.length > 0 && (
                              <div className="grid grid-cols-3 gap-2">
                                {listing.images.map((img, idx) => (
                                  <a 
                                    key={idx}
                                    href={img} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="block"
                                  >
                                    <img 
                                      src={img} 
                                      alt={`${listing.name} ${idx + 1}`}
                                      className="w-full h-32 object-cover rounded-lg border hover:opacity-80 transition-opacity"
                                    />
                                  </a>
                                ))}
                              </div>
                            )}

                            {/* Bike Details */}
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="text-sm font-medium">Name</label>
                                <p className="text-muted-foreground">{listing.name}</p>
                              </div>
                              <div>
                                <label className="text-sm font-medium">Category</label>
                                <p className="text-muted-foreground">{listing.category}</p>
                              </div>
                              <div>
                                <label className="text-sm font-medium">Engine</label>
                                <p className="text-muted-foreground">{listing.engine || 'N/A'}</p>
                              </div>
                              <div>
                                <label className="text-sm font-medium">Power</label>
                                <p className="text-muted-foreground">{listing.power || 'N/A'}</p>
                              </div>
                              <div>
                                <label className="text-sm font-medium">Price/Day</label>
                                <p className="text-muted-foreground font-bold">KES {listing.price_per_day.toLocaleString()}</p>
                              </div>
                              <div>
                                <label className="text-sm font-medium">Location</label>
                                <p className="text-muted-foreground">{listing.location}</p>
                              </div>
                            </div>

                            {listing.description && (
                              <div>
                                <label className="text-sm font-medium">Description</label>
                                <p className="text-muted-foreground">{listing.description}</p>
                              </div>
                            )}

                            {listing.notes && (
                              <div>
                                <label className="text-sm font-medium">Owner Notes</label>
                                <p className="text-muted-foreground">{listing.notes}</p>
                              </div>
                            )}

                            {/* Contact */}
                            <div className="flex gap-4">
                              <div>
                                <label className="text-sm font-medium">Phone</label>
                                <p className="text-muted-foreground">{listing.contact_phone}</p>
                              </div>
                              {listing.contact_email && (
                                <div>
                                  <label className="text-sm font-medium">Email</label>
                                  <p className="text-muted-foreground">{listing.contact_email}</p>
                                </div>
                              )}
                            </div>

                            {/* Admin Actions */}
                            <div>
                              <label className="text-sm font-medium block mb-2">Status</label>
                              <Select 
                                value={listing.status} 
                                onValueChange={(value) => updateListingStatus(listing.id, value, adminNotes)}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="pending">Pending</SelectItem>
                                  <SelectItem value="approved">Approved</SelectItem>
                                  <SelectItem value="active">Active</SelectItem>
                                  <SelectItem value="rejected">Rejected</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            <div>
                              <label className="text-sm font-medium block mb-2">Admin Notes</label>
                              <Textarea 
                                value={adminNotes}
                                onChange={(e) => setAdminNotes(e.target.value)}
                                placeholder="Add internal notes..."
                                rows={3}
                              />
                            </div>

                            <div className="flex gap-2">
                              <Button 
                                onClick={() => updateListingStatus(listing.id, listing.status, adminNotes)}
                                disabled={updatingId === listing.id}
                                className="flex-1"
                              >
                                {updatingId === listing.id && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                Save Changes
                              </Button>
                              {listing.status === 'pending' && (
                                <>
                                  <Button 
                                    variant="default"
                                    onClick={() => updateListingStatus(listing.id, 'approved', adminNotes)}
                                    disabled={updatingId === listing.id}
                                  >
                                    <CheckCircle className="w-4 h-4 mr-2" />
                                    Approve
                                  </Button>
                                  <Button 
                                    variant="destructive"
                                    onClick={() => updateListingStatus(listing.id, 'rejected', adminNotes)}
                                    disabled={updatingId === listing.id}
                                  >
                                    <XCircle className="w-4 h-4 mr-2" />
                                    Reject
                                  </Button>
                                </>
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
