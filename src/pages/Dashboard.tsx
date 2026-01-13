import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { useAuth } from '@/contexts/AuthContext';
import { getUserBookings, cancelBooking, Booking } from '@/lib/supabase-data';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Calendar, Bike, Wrench, Heart, Clock, MapPin, Phone, Mail, User, Loader2, Star, AlertCircle, ShieldAlert, Gift } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { format } from 'date-fns';
import ReviewModal from '@/components/reviews/ReviewModal';
import EmergencyContactsManager from '@/components/dashboard/EmergencyContactsManager';
import LoyaltyCard from '@/components/loyalty/LoyaltyCard';
import RewardsGrid from '@/components/loyalty/RewardsGrid';
import PointsHistory from '@/components/loyalty/PointsHistory';
import MyRewards from '@/components/loyalty/MyRewards';

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

export default function Dashboard() {
  const { profile, isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('bookings');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedBookingForReview, setSelectedBookingForReview] = useState<Booking | null>(null);

  // Fetch bookings from PocketBase
  const fetchBookings = async () => {
    if (!isLoggedIn) return;
    
    try {
      setIsLoading(true);
      setLoadError(null);
      const data = await getUserBookings();
      setBookings(data);
    } catch (error) {
      console.error('Failed to fetch bookings:', error);
      setLoadError('Could not connect to PocketBase. Please ensure it is running.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [isLoggedIn]);

  const handleCancelBooking = async (bookingId: string) => {
    try {
      setCancellingId(bookingId);
      await cancelBooking(bookingId);
      setBookings(prev => prev.map(b => 
        b.id === bookingId ? { ...b, status: 'cancelled' } : b
      ));
      toast.success('Booking cancelled successfully');
    } catch (error) {
      console.error('Failed to cancel booking:', error);
      toast.error('Failed to cancel booking');
    } finally {
      setCancellingId(null);
    }
  };

  const handleOpenReview = (booking: Booking) => {
    setSelectedBookingForReview(booking);
    setReviewModalOpen(true);
  };

  const handleReviewSubmitted = () => {
    // Mark the booking as reviewed locally
    if (selectedBookingForReview) {
      setBookings(prev => prev.map(b => 
        b.id === selectedBookingForReview.id ? { ...b, reviewed: true } : b
      ));
    }
  };

  // Empty arrays for services and saved bikes (to be implemented later)
  const userServiceHistory: { id: number; service: string; bike: string; date: string; status: string; price: number }[] = [];
  const userSavedBikes: { id: number; name: string; category: string; price: number; image: string }[] = [];

  // Redirect to auth if not logged in
  if (!isLoggedIn) {
    return (
      <>
        <Navbar />
        <main className="pt-20 min-h-screen bg-background flex items-center justify-center">
          <Card className="max-w-md w-full mx-4">
            <CardContent className="pt-6 text-center">
              <User className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h2 className="text-2xl font-display mb-2">LOGIN REQUIRED</h2>
              <p className="text-muted-foreground mb-6">Please login to access your dashboard</p>
              <Button onClick={() => navigate('/auth')}>Login Now</Button>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </>
    );
  }

  const activeBookings = bookings.filter(b => b.status === 'active' || b.status === 'confirmed');

  return (
    <>
      <Helmet>
        <title>My Dashboard | MotoLink Africa</title>
        <meta name="description" content="Manage your bookings, view service history, and track your saved bikes." />
      </Helmet>

      <Navbar />

      <main className="pt-20 min-h-screen bg-background">
        {/* Header */}
        <section className="bg-secondary py-12">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
            >
              <div>
                <h1 className="text-4xl font-display text-secondary-foreground mb-2">
                  WELCOME BACK, <span className="text-primary">{profile?.name?.toUpperCase() || 'RIDER'}</span>
                </h1>
                <div className="flex items-center gap-4 text-secondary-foreground/80">
                  <span className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    {profile?.email}
                  </span>
                  {profile?.phone && (
                    <span className="flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      {profile.phone}
                    </span>
                  )}
                </div>
              </div>
              <Button variant="hero" onClick={() => navigate('/hire')}>
                <Bike className="w-5 h-5" />
                Book a Bike
              </Button>
            </motion.div>
          </div>
        </section>

        {/* Stats Cards */}
        <section className="py-8">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-lg bg-primary/10">
                        <Calendar className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{bookings.length}</p>
                        <p className="text-sm text-muted-foreground">Total Bookings</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
              
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-lg bg-success/10">
                        <Clock className="w-6 h-6 text-success" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{activeBookings.length}</p>
                        <p className="text-sm text-muted-foreground">Active Rentals</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
              
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-lg bg-accent/10">
                        <Wrench className="w-6 h-6 text-accent" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{userServiceHistory.length}</p>
                        <p className="text-sm text-muted-foreground">Services Done</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
              
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-lg bg-destructive/10">
                        <Heart className="w-6 h-6 text-destructive" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{userSavedBikes.length}</p>
                        <p className="text-sm text-muted-foreground">Saved Bikes</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Tabs Content */}
        <section className="py-8 pb-16">
          <div className="container mx-auto px-4">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full max-w-2xl grid-cols-5 mb-8">
                <TabsTrigger value="bookings" className="flex items-center gap-2">
                  <Bike className="w-4 h-4" />
                  <span className="hidden sm:inline">Bookings</span>
                </TabsTrigger>
                <TabsTrigger value="rewards" className="flex items-center gap-2">
                  <Gift className="w-4 h-4" />
                  <span className="hidden sm:inline">Rewards</span>
                </TabsTrigger>
                <TabsTrigger value="services" className="flex items-center gap-2">
                  <Wrench className="w-4 h-4" />
                  <span className="hidden sm:inline">Services</span>
                </TabsTrigger>
                <TabsTrigger value="emergency" className="flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4" />
                  <span className="hidden sm:inline">Emergency</span>
                </TabsTrigger>
                <TabsTrigger value="saved" className="flex items-center gap-2">
                  <Heart className="w-4 h-4" />
                  <span className="hidden sm:inline">Saved</span>
                </TabsTrigger>
              </TabsList>

              {/* Bookings Tab */}
              <TabsContent value="bookings">
                <div className="space-y-4">
                  {isLoading ? (
                    <Card>
                      <CardContent className="py-12 text-center">
                        <Loader2 className="w-12 h-12 mx-auto text-primary animate-spin mb-4" />
                        <p className="text-muted-foreground">Loading bookings...</p>
                      </CardContent>
                    </Card>
                  ) : loadError ? (
                    <Card>
                      <CardContent className="py-12 text-center">
                        <AlertCircle className="w-12 h-12 mx-auto text-destructive mb-4" />
                        <p className="text-destructive font-medium mb-2">Connection Error</p>
                        <p className="text-muted-foreground text-sm mb-4">{loadError}</p>
                        <Button onClick={fetchBookings}>
                          Try Again
                        </Button>
                      </CardContent>
                    </Card>
                  ) : bookings.length === 0 ? (
                    <Card>
                      <CardContent className="py-12 text-center">
                        <Bike className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">No bookings yet</p>
                        <Button className="mt-4" onClick={() => navigate('/hire')}>Book Your First Bike</Button>
                      </CardContent>
                    </Card>
                  ) : (
                    bookings.map((booking, index) => (
                      <motion.div
                        key={booking.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <Card>
                          <CardContent className="p-6">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                              <div className="flex items-start gap-4">
                                <div className="p-3 rounded-lg bg-primary/10">
                                  <Bike className="w-8 h-8 text-primary" />
                                </div>
                                <div>
                                  <h3 className="font-semibold text-lg">{booking.bike_name || `Bike #${booking.bike_id}`}</h3>
                                  <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                                    <MapPin className="w-4 h-4" />
                                    {booking.pickup_location}
                                  </div>
                                  <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                                    <Calendar className="w-4 h-4" />
                                    {format(new Date(booking.pickup_date), 'PPP')} → {format(new Date(booking.return_date), 'PPP')}
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                <div className="text-right">
                                  <p className="text-2xl font-bold text-primary">KES {booking.total_price.toLocaleString()}</p>
                                  <Badge className={getStatusColor(booking.status)}>
                                    {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                                  </Badge>
                                </div>
                                <div className="flex flex-col gap-2">
                                  {booking.status === 'pending' && (
                                    <Button 
                                      variant="outline" 
                                      size="sm"
                                      disabled={cancellingId === booking.id}
                                      onClick={() => handleCancelBooking(booking.id)}
                                    >
                                      {cancellingId === booking.id ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                      ) : (
                                        'Cancel'
                                      )}
                                    </Button>
                                  )}
                                  {booking.status === 'completed' && !booking.reviewed && (
                                    <Button 
                                      variant="hero" 
                                      size="sm"
                                      onClick={() => handleOpenReview(booking)}
                                    >
                                      <Star className="w-4 h-4" />
                                      Review
                                    </Button>
                                  )}
                                  {booking.reviewed && (
                                    <Badge variant="outline" className="text-primary">
                                      <Star className="w-3 h-3 fill-primary mr-1" />
                                      Reviewed
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))
                  )}
                </div>
              </TabsContent>

              {/* Rewards Tab */}
              <TabsContent value="rewards">
                <div className="space-y-6">
                  <LoyaltyCard />
                  <div className="grid lg:grid-cols-2 gap-6">
                    <MyRewards />
                    <PointsHistory />
                  </div>
                  <RewardsGrid />
                </div>
              </TabsContent>

              {/* Services Tab */}
              <TabsContent value="services">
                <div className="space-y-4">
                  <Card>
                    <CardContent className="py-12 text-center">
                      <Wrench className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">No service history yet</p>
                      <Button className="mt-4" onClick={() => navigate('/mechanic')}>Book a Service</Button>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Emergency Contacts Tab */}
              <TabsContent value="emergency">
                <EmergencyContactsManager />
              </TabsContent>

              {/* Saved Bikes Tab */}
              <TabsContent value="saved">
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <Card className="col-span-full">
                    <CardContent className="py-12 text-center">
                      <Heart className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">No saved bikes yet</p>
                      <Button className="mt-4" onClick={() => navigate('/hire')}>Browse Bikes</Button>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </section>
      </main>

      <Footer />

      {/* Review Modal */}
      <ReviewModal
        isOpen={reviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
        bookingId={selectedBookingForReview?.id || ''}
        bikeName={selectedBookingForReview?.bike_name || `Bike #${selectedBookingForReview?.bike_id}`}
        onReviewSubmitted={handleReviewSubmitted}
      />
    </>
  );
}