import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { Search, Phone, MessageCircle, Calendar, Users, MapPin, Check, X, Plus, Edit2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const bookingStatusColors: Record<string, string> = {
  pending: 'bg-warning',
  confirmed: 'bg-success',
  cancelled: 'bg-destructive',
  completed: 'bg-muted',
};

const difficultyColors: Record<string, string> = {
  easy: 'bg-success',
  moderate: 'bg-accent',
  challenging: 'bg-warning',
  expert: 'bg-destructive',
};

export default function ToursManager() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBooking, setSelectedBooking] = useState<any>(null);

  // Fetch tours
  const { data: tours, isLoading: loadingTours } = useQuery({
    queryKey: ['admin-guided-tours'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('guided_tours')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  // Fetch bookings
  const { data: bookings, isLoading: loadingBookings } = useQuery({
    queryKey: ['admin-tour-bookings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tour_bookings')
        .select('*, guided_tours(title)')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  // Fetch routes
  const { data: routes, isLoading: loadingRoutes } = useQuery({
    queryKey: ['admin-self-guided-routes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('self_guided_routes')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const updateBookingMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: any }) => {
      const { error } = await supabase
        .from('tour_bookings')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-tour-bookings'] });
      toast.success('Booking updated');
      setSelectedBooking(null);
    },
    onError: () => {
      toast.error('Failed to update booking');
    },
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const stats = {
    pendingBookings: bookings?.filter(b => b.status === 'pending').length || 0,
    activeTours: tours?.filter(t => t.active).length || 0,
    activeRoutes: routes?.filter(r => r.active).length || 0,
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-display text-warning">{stats.pendingBookings}</p>
            <p className="text-sm text-muted-foreground">Pending Bookings</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-display text-success">{stats.activeTours}</p>
            <p className="text-sm text-muted-foreground">Active Tours</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-display text-primary">{stats.activeRoutes}</p>
            <p className="text-sm text-muted-foreground">Active Routes</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="bookings" className="space-y-4">
        <TabsList>
          <TabsTrigger value="bookings">Bookings</TabsTrigger>
          <TabsTrigger value="tours">Guided Tours</TabsTrigger>
          <TabsTrigger value="routes">Self-Guided Routes</TabsTrigger>
        </TabsList>

        {/* Bookings Tab */}
        <TabsContent value="bookings">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tour</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Guests</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loadingBookings ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">Loading...</TableCell>
                    </TableRow>
                  ) : bookings?.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        No bookings yet
                      </TableCell>
                    </TableRow>
                  ) : (
                    bookings?.map((booking: any) => (
                      <TableRow key={booking.id}>
                        <TableCell>
                          <p className="font-medium">{booking.guided_tours?.title || 'Unknown Tour'}</p>
                        </TableCell>
                        <TableCell>
                          {format(new Date(booking.tour_date), 'MMM d, yyyy')}
                        </TableCell>
                        <TableCell>
                          <span className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            {booking.participants}
                          </span>
                        </TableCell>
                        <TableCell className="font-medium text-primary">
                          {formatPrice(booking.total_price)}
                        </TableCell>
                        <TableCell>
                          <a href={`tel:${booking.contact_phone}`} className="text-primary hover:underline">
                            {booking.contact_phone}
                          </a>
                        </TableCell>
                        <TableCell>
                          <Badge className={`${bookingStatusColors[booking.status]} text-white`}>
                            {booking.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => setSelectedBooking(booking)}>
                              Manage
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Guided Tours Tab */}
        <TabsContent value="tours">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Guided Tours</CardTitle>
              <Button variant="hero" size="sm">
                <Plus className="w-4 h-4" />
                Add Tour
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tour</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Difficulty</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loadingTours ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">Loading...</TableCell>
                    </TableRow>
                  ) : tours?.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        No tours created yet
                      </TableCell>
                    </TableRow>
                  ) : (
                    tours?.map((tour) => (
                      <TableRow key={tour.id}>
                        <TableCell>
                          <p className="font-medium">{tour.title}</p>
                          <p className="text-sm text-muted-foreground">{tour.meeting_point}</p>
                        </TableCell>
                        <TableCell>{tour.duration_hours}h</TableCell>
                        <TableCell>
                          <Badge className={`${difficultyColors[tour.difficulty]} text-white`}>
                            {tour.difficulty}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium">
                          {formatPrice(tour.price_per_person)}/person
                        </TableCell>
                        <TableCell>
                          <Badge variant={tour.active ? 'default' : 'secondary'}>
                            {tour.active ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline">
                              <Edit2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Self-Guided Routes Tab */}
        <TabsContent value="routes">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Self-Guided Routes</CardTitle>
              <Button variant="hero" size="sm">
                <Plus className="w-4 h-4" />
                Add Route
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Route</TableHead>
                    <TableHead>Distance</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Difficulty</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loadingRoutes ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">Loading...</TableCell>
                    </TableRow>
                  ) : routes?.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        No routes created yet
                      </TableCell>
                    </TableRow>
                  ) : (
                    routes?.map((route) => (
                      <TableRow key={route.id}>
                        <TableCell>
                          <p className="font-medium">{route.title}</p>
                          <p className="text-sm text-muted-foreground">{route.start_point} → {route.end_point}</p>
                        </TableCell>
                        <TableCell>{route.distance_km} km</TableCell>
                        <TableCell>~{route.estimated_hours}h</TableCell>
                        <TableCell>
                          <Badge className={`${difficultyColors[route.difficulty]} text-white`}>
                            {route.difficulty}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={route.active ? 'default' : 'secondary'}>
                            {route.active ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline">
                              <Edit2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Booking Detail Dialog */}
      <Dialog open={!!selectedBooking} onOpenChange={() => setSelectedBooking(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Booking Details</DialogTitle>
          </DialogHeader>
          
          {selectedBooking && (
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <p className="font-medium">{selectedBooking.guided_tours?.title}</p>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(selectedBooking.tour_date), 'EEEE, MMMM d, yyyy')}
                </p>
                <p className="text-sm">{selectedBooking.participants} participants</p>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Total:</span>
                <span className="font-display text-2xl text-primary">
                  {formatPrice(selectedBooking.total_price)}
                </span>
              </div>

              {selectedBooking.special_requests && (
                <div>
                  <Label>Special Requests</Label>
                  <p className="text-sm text-muted-foreground">{selectedBooking.special_requests}</p>
                </div>
              )}

              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => window.open(`tel:${selectedBooking.contact_phone}`)}>
                  <Phone className="w-4 h-4" />
                  Call
                </Button>
                <Button variant="outline" className="flex-1" onClick={() => window.open(`https://wa.me/${selectedBooking.contact_phone}`)}>
                  <MessageCircle className="w-4 h-4" />
                  WhatsApp
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {selectedBooking.status === 'pending' && (
                  <>
                    <Button variant="hero" onClick={() => updateBookingMutation.mutate({ id: selectedBooking.id, updates: { status: 'confirmed' } })}>
                      <Check className="w-4 h-4" />
                      Confirm
                    </Button>
                    <Button variant="destructive" onClick={() => updateBookingMutation.mutate({ id: selectedBooking.id, updates: { status: 'cancelled' } })}>
                      <X className="w-4 h-4" />
                      Cancel
                    </Button>
                  </>
                )}
                {selectedBooking.status === 'confirmed' && (
                  <Button variant="hero" className="col-span-2" onClick={() => updateBookingMutation.mutate({ id: selectedBooking.id, updates: { status: 'completed' } })}>
                    <Check className="w-4 h-4" />
                    Mark Completed
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