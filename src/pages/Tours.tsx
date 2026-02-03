import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { MapPin, Clock, Users, Mountain, Download, Navigation, Star, ChevronRight, Send } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import PageHero from '@/components/shared/PageHero';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import TourBookingModal from '@/components/tours/TourBookingModal';
import RouteRequestForm from '@/components/tours/RouteRequestForm';
const difficultyColors: Record<string, string> = {
  easy: 'bg-success',
  moderate: 'bg-accent',
  challenging: 'bg-warning',
  expert: 'bg-destructive',
};

export default function Tours() {
  const [selectedTour, setSelectedTour] = useState<any>(null);
  const [isBookingOpen, setIsBookingOpen] = useState(false);

  const { data: guidedTours, isLoading: loadingGuided } = useQuery({
    queryKey: ['guided-tours'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('guided_tours')
        .select('*')
        .eq('active', true)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: selfGuidedRoutes, isLoading: loadingRoutes } = useQuery({
    queryKey: ['self-guided-routes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('self_guided_routes')
        .select('*')
        .eq('active', true)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const handleBookTour = (tour: any) => {
    setSelectedTour(tour);
    setIsBookingOpen(true);
  };

  return (
    <>
      <Helmet>
        <title>Motorcycle Tours & Routes | MotoLink Africa</title>
        <meta name="description" content="Explore Kenya on two wheels! Book guided motorcycle tours or download self-guided route maps for scenic adventures." />
      </Helmet>

      <Navbar />

      <PageHero
        title="TOURS &"
        titleHighlight="ROUTES"
        subtitle="Explore Africa's most scenic roads on two wheels"
        image="/placeholder.svg"
      />

      <main className="py-12">
        <div className="container mx-auto px-4">
          <Tabs defaultValue="guided" className="space-y-8">
            <TabsList className="grid w-full max-w-lg mx-auto grid-cols-3">
              <TabsTrigger value="guided" className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Guided Tours
              </TabsTrigger>
              <TabsTrigger value="self-guided" className="flex items-center gap-2">
                <Navigation className="w-4 h-4" />
                Self-Guided
              </TabsTrigger>
              <TabsTrigger value="suggest" className="flex items-center gap-2">
                <Send className="w-4 h-4" />
                Suggest Route
              </TabsTrigger>
            </TabsList>

            {/* Guided Tours */}
            <TabsContent value="guided">
              {loadingGuided ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(3)].map((_, i) => (
                    <Card key={i} className="animate-pulse">
                      <div className="aspect-video bg-muted" />
                      <CardContent className="p-4 space-y-3">
                        <div className="h-6 bg-muted rounded" />
                        <div className="h-4 bg-muted rounded w-2/3" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : guidedTours && guidedTours.length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {guidedTours.map((tour, index) => (
                    <motion.div
                      key={tour.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card className="group overflow-hidden hover-lift h-full flex flex-col">
                        <div className="aspect-video relative overflow-hidden bg-muted">
                          {tour.images && tour.images[0] ? (
                            <img
                              src={tour.images[0]}
                              alt={tour.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-accent/20">
                              <Mountain className="w-16 h-16 text-primary/50" />
                            </div>
                          )}
                          <Badge className={`absolute top-3 left-3 ${difficultyColors[tour.difficulty]} text-white`}>
                            {tour.difficulty}
                          </Badge>
                        </div>

                        <CardContent className="p-5 flex-1 flex flex-col">
                          <h3 className="font-display text-xl text-card-foreground mb-2">{tour.title}</h3>
                          <p className="text-sm text-muted-foreground mb-4 line-clamp-2 flex-1">
                            {tour.description}
                          </p>

                          <div className="flex flex-wrap gap-3 text-sm text-muted-foreground mb-4">
                            <span className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {tour.duration_hours}h
                            </span>
                            <span className="flex items-center gap-1">
                              <Users className="w-4 h-4" />
                              Max {tour.max_participants}
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              {tour.meeting_point}
                            </span>
                          </div>

                          {tour.includes && tour.includes.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-4">
                              {tour.includes.slice(0, 3).map((item: string, i: number) => (
                                <Badge key={i} variant="secondary" className="text-xs">
                                  {item}
                                </Badge>
                              ))}
                              {tour.includes.length > 3 && (
                                <Badge variant="secondary" className="text-xs">
                                  +{tour.includes.length - 3} more
                                </Badge>
                              )}
                            </div>
                          )}

                          <div className="flex items-center justify-between mt-auto pt-4 border-t border-border">
                            <div>
                              <span className="text-sm text-muted-foreground">From</span>
                              <p className="font-display text-2xl text-primary">
                                {formatPrice(tour.price_per_person)}
                              </p>
                              <span className="text-xs text-muted-foreground">per person</span>
                            </div>
                            <Button variant="hero" onClick={() => handleBookTour(tour)}>
                              Book Now
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <Mountain className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="font-display text-2xl text-foreground mb-2">Tours Coming Soon</h3>
                  <p className="text-muted-foreground">
                    We're curating amazing motorcycle tours. Check back soon!
                  </p>
                </div>
              )}
            </TabsContent>

            {/* Self-Guided Routes */}
            <TabsContent value="self-guided">
              {loadingRoutes ? (
                <div className="grid md:grid-cols-2 gap-6">
                  {[...Array(4)].map((_, i) => (
                    <Card key={i} className="animate-pulse">
                      <CardContent className="p-6 space-y-3">
                        <div className="h-6 bg-muted rounded" />
                        <div className="h-4 bg-muted rounded w-2/3" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : selfGuidedRoutes && selfGuidedRoutes.length > 0 ? (
                <div className="grid md:grid-cols-2 gap-6">
                  {selfGuidedRoutes.map((route, index) => (
                    <motion.div
                      key={route.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card className="group hover-lift">
                        <div className="flex flex-col md:flex-row">
                          <div className="md:w-1/3 aspect-video md:aspect-square relative overflow-hidden bg-muted">
                            {route.images && route.images[0] ? (
                              <img
                                src={route.images[0]}
                                alt={route.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-accent/20 to-primary/20">
                                <Navigation className="w-12 h-12 text-accent/50" />
                              </div>
                            )}
                          </div>

                          <CardContent className="flex-1 p-5">
                            <div className="flex items-start justify-between mb-2">
                              <h3 className="font-display text-xl text-card-foreground">{route.title}</h3>
                              <Badge className={`${difficultyColors[route.difficulty]} text-white`}>
                                {route.difficulty}
                              </Badge>
                            </div>

                            <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                              {route.description}
                            </p>

                            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
                              <span className="flex items-center gap-1">
                                <Navigation className="w-4 h-4" />
                                {route.distance_km} km
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                ~{route.estimated_hours}h
                              </span>
                            </div>

                            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                              <MapPin className="w-4 h-4 text-primary" />
                              <span>{route.start_point}</span>
                              <ChevronRight className="w-4 h-4" />
                              <span>{route.end_point}</span>
                            </div>

                            {route.terrain_type && route.terrain_type.length > 0 && (
                              <div className="flex flex-wrap gap-1 mb-4">
                                {route.terrain_type.map((terrain: string, i: number) => (
                                  <Badge key={i} variant="outline" className="text-xs">
                                    {terrain}
                                  </Badge>
                                ))}
                              </div>
                            )}

                            <div className="flex gap-2 mt-auto">
                              {route.map_url && (
                                <Button variant="outline" size="sm" asChild>
                                  <a href={route.map_url} target="_blank" rel="noopener noreferrer">
                                    <MapPin className="w-4 h-4" />
                                    View Map
                                  </a>
                                </Button>
                              )}
                              {route.gpx_file_url && (
                                <Button variant="hero" size="sm" asChild>
                                  <a href={route.gpx_file_url} download>
                                    <Download className="w-4 h-4" />
                                    Download GPX
                                  </a>
                                </Button>
                              )}
                            </div>
                          </CardContent>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <Navigation className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="font-display text-2xl text-foreground mb-2">Routes Coming Soon</h3>
                  <p className="text-muted-foreground">
                    We're mapping out the best motorcycle routes. Stay tuned!
                  </p>
                </div>
              )}
            </TabsContent>

            {/* Suggest a Route Tab */}
            <TabsContent value="suggest">
              <div className="max-w-2xl mx-auto">
                <RouteRequestForm />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />

      <TourBookingModal
        tour={selectedTour}
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
      />
    </>
  );
}