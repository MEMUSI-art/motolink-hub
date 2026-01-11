import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  LayoutDashboard, Users, Bike, Wrench, Calendar, 
  TrendingUp, CheckCircle, XCircle, Clock, Loader2,
  Mail, RefreshCw, Shield
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { format } from 'date-fns';
import QuickActionsPanel from '@/components/admin/QuickActionsPanel';

interface BookingRow {
  id: string;
  user_id: string;
  bike_name: string | null;
  pickup_date: string;
  return_date: string;
  pickup_location: string;
  status: string;
  total_price: number;
  created_at: string;
}

interface ServiceRow {
  id: string;
  user_id: string;
  name: string;
  phone: string;
  bike: string;
  services: unknown;
  preferred_date: string;
  status: string;
  total_price: number;
  created_at: string;
}

interface SubscriberRow {
  id: string;
  email: string;
  name: string | null;
  subscribed: boolean;
  created_at: string;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'active': return 'bg-success text-success-foreground';
    case 'completed': return 'bg-muted text-muted-foreground';
    case 'pending': return 'bg-accent text-accent-foreground';
    case 'confirmed': return 'bg-primary text-primary-foreground';
    case 'cancelled': return 'bg-destructive text-destructive-foreground';
    default: return 'bg-secondary text-secondary-foreground';
  }
};

export default function Admin() {
  const { isLoggedIn, userRole } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [bookings, setBookings] = useState<BookingRow[]>([]);
  const [services, setServices] = useState<ServiceRow[]>([]);
  const [subscribers, setSubscribers] = useState<SubscriberRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Check if user is admin/supervisor
  const isAuthorized = userRole?.role === 'admin' || userRole?.role === 'supervisor';

  // Fetch all data
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [bookingsRes, servicesRes, subscribersRes] = await Promise.all([
        supabase.from('bookings').select('*').order('created_at', { ascending: false }),
        supabase.from('services').select('*').order('created_at', { ascending: false }),
        supabase.from('newsletter_subscribers').select('*').order('created_at', { ascending: false }),
      ]);

      if (bookingsRes.data) setBookings(bookingsRes.data);
      if (servicesRes.data) setServices(servicesRes.data);
      if (subscribersRes.data) setSubscribers(subscribersRes.data);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      toast.error('Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  // Subscribe to realtime updates
  useEffect(() => {
    if (!isAuthorized) return;

    fetchData();

    // Realtime subscriptions
    const bookingsChannel = supabase
      .channel('admin-bookings')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings' }, (payload) => {
        console.log('Booking update:', payload);
        if (payload.eventType === 'INSERT') {
          setBookings(prev => [payload.new as BookingRow, ...prev]);
          toast.info('New booking received!');
        } else if (payload.eventType === 'UPDATE') {
          setBookings(prev => prev.map(b => b.id === payload.new.id ? payload.new as BookingRow : b));
        }
      })
      .subscribe();

    const servicesChannel = supabase
      .channel('admin-services')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'services' }, (payload) => {
        console.log('Service update:', payload);
        if (payload.eventType === 'INSERT') {
          setServices(prev => [payload.new as ServiceRow, ...prev]);
          toast.info('New service request received!');
        } else if (payload.eventType === 'UPDATE') {
          setServices(prev => prev.map(s => s.id === payload.new.id ? payload.new as ServiceRow : s));
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(bookingsChannel);
      supabase.removeChannel(servicesChannel);
    };
  }, [isAuthorized]);

  const updateBookingStatus = async (id: string, status: string) => {
    setUpdatingId(id);
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status })
        .eq('id', id);
      
      if (error) throw error;
      toast.success(`Booking ${status}`);
    } catch (error) {
      toast.error('Failed to update booking');
    } finally {
      setUpdatingId(null);
    }
  };

  const updateServiceStatus = async (id: string, status: string) => {
    setUpdatingId(id);
    try {
      const { error } = await supabase
        .from('services')
        .update({ status })
        .eq('id', id);
      
      if (error) throw error;
      toast.success(`Service ${status}`);
    } catch (error) {
      toast.error('Failed to update service');
    } finally {
      setUpdatingId(null);
    }
  };

  // Redirect if not logged in
  if (!isLoggedIn) {
    return (
      <>
        <Navbar />
        <main className="pt-20 min-h-screen bg-background flex items-center justify-center">
          <Card className="max-w-md w-full mx-4">
            <CardContent className="pt-6 text-center">
              <Shield className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h2 className="text-2xl font-display mb-2">ADMIN ACCESS</h2>
              <p className="text-muted-foreground mb-6">Please login with admin credentials</p>
              <Button onClick={() => navigate('/auth')}>Login</Button>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </>
    );
  }

  // Show unauthorized message
  if (!isAuthorized) {
    return (
      <>
        <Navbar />
        <main className="pt-20 min-h-screen bg-background flex items-center justify-center">
          <Card className="max-w-md w-full mx-4">
            <CardContent className="pt-6 text-center">
              <Shield className="w-16 h-16 mx-auto text-destructive mb-4" />
              <h2 className="text-2xl font-display mb-2">UNAUTHORIZED</h2>
              <p className="text-muted-foreground mb-6">You need supervisor or admin role to access this page</p>
              <Button onClick={() => navigate('/')}>Go Home</Button>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </>
    );
  }

  // Stats
  const pendingBookings = bookings.filter(b => b.status === 'pending').length;
  const activeBookings = bookings.filter(b => b.status === 'active' || b.status === 'confirmed').length;
  const pendingServices = services.filter(s => s.status === 'pending').length;
  const totalRevenue = bookings
    .filter(b => b.status !== 'cancelled')
    .reduce((sum, b) => sum + (b.total_price || 0), 0);

  return (
    <>
      <Helmet>
        <title>Admin Dashboard | MotoLink Africa</title>
        <meta name="description" content="Manage bookings, services, and users." />
      </Helmet>

      <Navbar />

      <main className="pt-20 min-h-screen bg-background">
        {/* Header */}
        <section className="bg-secondary py-8">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-display text-secondary-foreground mb-1">
                  ADMIN <span className="text-primary">DASHBOARD</span>
                </h1>
                <p className="text-secondary-foreground/70">Manage bookings, services, and subscribers</p>
              </div>
              <Button variant="outline" onClick={fetchData} disabled={isLoading}>
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="py-6">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-lg bg-primary/20">
                        <Clock className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <p className="text-3xl font-bold">{pendingBookings}</p>
                        <p className="text-sm text-muted-foreground">Pending Bookings</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <Card className="bg-gradient-to-br from-success/10 to-success/5 border-success/20">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-lg bg-success/20">
                        <Bike className="w-6 h-6 text-success" />
                      </div>
                      <div>
                        <p className="text-3xl font-bold">{activeBookings}</p>
                        <p className="text-sm text-muted-foreground">Active Rentals</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                <Card className="bg-gradient-to-br from-accent/10 to-accent/5 border-accent/20">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-lg bg-accent/20">
                        <Wrench className="w-6 h-6 text-accent" />
                      </div>
                      <div>
                        <p className="text-3xl font-bold">{pendingServices}</p>
                        <p className="text-sm text-muted-foreground">Service Requests</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                <Card className="bg-gradient-to-br from-secondary to-secondary/80 border-border/20">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-lg bg-primary/20">
                        <TrendingUp className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">KES {(totalRevenue / 1000).toFixed(0)}K</p>
                        <p className="text-sm text-muted-foreground">Total Revenue</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Tabs */}
        <section className="py-6 pb-16">
          <div className="container mx-auto px-4">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full max-w-lg grid-cols-4 mb-8">
                <TabsTrigger value="overview" className="flex items-center gap-2">
                  <LayoutDashboard className="w-4 h-4" />
                  Overview
                </TabsTrigger>
                <TabsTrigger value="bookings" className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Bookings
                </TabsTrigger>
                <TabsTrigger value="services" className="flex items-center gap-2">
                  <Wrench className="w-4 h-4" />
                  Services
                </TabsTrigger>
                <TabsTrigger value="subscribers" className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Newsletter
                </TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview">
                <div className="grid md:grid-cols-3 gap-6">
                  {/* Quick Actions Panel */}
                  <div className="md:col-span-1">
                    <QuickActionsPanel 
                      bookings={bookings} 
                      services={services} 
                      onStatusUpdate={fetchData}
                    />
                  </div>

                  {/* Recent Activity */}
                  <div className="md:col-span-2 space-y-6">
                    {/* Recent Bookings */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Calendar className="w-5 h-5 text-primary" />
                          Recent Bookings
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {isLoading ? (
                          <div className="flex items-center justify-center py-8">
                            <Loader2 className="w-8 h-8 animate-spin text-primary" />
                          </div>
                        ) : bookings.length === 0 ? (
                          <p className="text-muted-foreground text-center py-8">No bookings yet</p>
                        ) : (
                          <div className="space-y-3">
                            {bookings.slice(0, 5).map(booking => (
                              <div key={booking.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                                <div>
                                  <p className="font-medium">{booking.bike_name || 'Bike Rental'}</p>
                                  <p className="text-sm text-muted-foreground">
                                    {format(new Date(booking.created_at), 'MMM d, h:mm a')}
                                  </p>
                                </div>
                                <Badge className={getStatusColor(booking.status)}>
                                  {booking.status}
                                </Badge>
                              </div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    {/* Recent Services */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Wrench className="w-5 h-5 text-accent" />
                          Recent Service Requests
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {isLoading ? (
                          <div className="flex items-center justify-center py-8">
                            <Loader2 className="w-8 h-8 animate-spin text-primary" />
                          </div>
                        ) : services.length === 0 ? (
                          <p className="text-muted-foreground text-center py-8">No service requests yet</p>
                        ) : (
                          <div className="space-y-3">
                            {services.slice(0, 5).map(service => (
                              <div key={service.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                                <div>
                                  <p className="font-medium">{service.name}</p>
                                  <p className="text-sm text-muted-foreground">{service.bike}</p>
                                </div>
                                <Badge className={getStatusColor(service.status)}>
                                  {service.status}
                                </Badge>
                              </div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </TabsContent>

              {/* Bookings Tab */}
              <TabsContent value="bookings">
                <Card>
                  <CardHeader>
                    <CardTitle>All Bookings ({bookings.length})</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <div className="flex items-center justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {bookings.map(booking => (
                          <div key={booking.id} className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-muted/30 rounded-lg border border-border/50 gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="font-semibold">{booking.bike_name || 'Bike Rental'}</h3>
                                <Badge className={getStatusColor(booking.status)}>{booking.status}</Badge>
                              </div>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-muted-foreground">
                                <span>📍 {booking.pickup_location}</span>
                                <span>📅 {format(new Date(booking.pickup_date), 'MMM d')} - {format(new Date(booking.return_date), 'MMM d')}</span>
                                <span>💰 KES {booking.total_price?.toLocaleString()}</span>
                                <span>🕐 {format(new Date(booking.created_at), 'MMM d, h:mm a')}</span>
                              </div>
                            </div>
                            {booking.status === 'pending' && (
                              <div className="flex gap-2">
                                <Button 
                                  size="sm" 
                                  onClick={() => updateBookingStatus(booking.id, 'confirmed')}
                                  disabled={updatingId === booking.id}
                                >
                                  {updatingId === booking.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                                  Confirm
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => updateBookingStatus(booking.id, 'cancelled')}
                                  disabled={updatingId === booking.id}
                                >
                                  <XCircle className="w-4 h-4" />
                                  Cancel
                                </Button>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Services Tab */}
              <TabsContent value="services">
                <Card>
                  <CardHeader>
                    <CardTitle>Service Requests ({services.length})</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <div className="flex items-center justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                      </div>
                    ) : services.length === 0 ? (
                      <p className="text-muted-foreground text-center py-12">No service requests yet</p>
                    ) : (
                      <div className="space-y-4">
                        {services.map(service => (
                          <div key={service.id} className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-muted/30 rounded-lg border border-border/50 gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="font-semibold">{service.name}</h3>
                                <Badge className={getStatusColor(service.status)}>{service.status}</Badge>
                              </div>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-muted-foreground">
                                <span>🏍️ {service.bike}</span>
                                <span>📞 {service.phone}</span>
                                <span>📅 {format(new Date(service.preferred_date), 'MMM d, yyyy')}</span>
                                <span>💰 KES {service.total_price?.toLocaleString()}</span>
                              </div>
                              <div className="mt-2 text-sm">
                                <span className="text-muted-foreground">Services: </span>
                                {Array.isArray(service.services) ? (service.services as string[]).join(', ') : 'N/A'}
                              </div>
                            </div>
                            {service.status === 'pending' && (
                              <div className="flex gap-2">
                                <Button 
                                  size="sm" 
                                  onClick={() => updateServiceStatus(service.id, 'confirmed')}
                                  disabled={updatingId === service.id}
                                >
                                  {updatingId === service.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                                  Confirm
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => updateServiceStatus(service.id, 'cancelled')}
                                  disabled={updatingId === service.id}
                                >
                                  <XCircle className="w-4 h-4" />
                                  Cancel
                                </Button>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Newsletter Tab */}
              <TabsContent value="subscribers">
                <Card>
                  <CardHeader>
                    <CardTitle>Newsletter Subscribers ({subscribers.length})</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <div className="flex items-center justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                      </div>
                    ) : subscribers.length === 0 ? (
                      <p className="text-muted-foreground text-center py-12">No subscribers yet</p>
                    ) : (
                      <div className="space-y-3">
                        {subscribers.map(sub => (
                          <div key={sub.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                            <div>
                              <p className="font-medium">{sub.email}</p>
                              <p className="text-sm text-muted-foreground">
                                {sub.name || 'No name'} • Subscribed {format(new Date(sub.created_at), 'MMM d, yyyy')}
                              </p>
                            </div>
                            <Badge variant={sub.subscribed ? 'default' : 'secondary'}>
                              {sub.subscribed ? 'Active' : 'Unsubscribed'}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
