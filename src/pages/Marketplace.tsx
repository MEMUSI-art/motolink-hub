import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Search, Filter, MapPin, Calendar, Gauge, Plus, Bike, Car } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import PageHero from '@/components/shared/PageHero';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const vehicleTypes = [
  { value: 'all', label: 'All Vehicles' },
  { value: 'motorcycle', label: 'Motorcycles' },
  { value: 'scooter', label: 'Scooters' },
  { value: 'buggy', label: 'Buggies' },
  { value: 'atv', label: 'ATVs' },
];

const conditions = [
  { value: 'new', label: 'New', color: 'bg-success' },
  { value: 'like_new', label: 'Like New', color: 'bg-success/80' },
  { value: 'excellent', label: 'Excellent', color: 'bg-primary' },
  { value: 'good', label: 'Good', color: 'bg-accent' },
  { value: 'fair', label: 'Fair', color: 'bg-warning' },
];

export default function Marketplace() {
  const [searchQuery, setSearchQuery] = useState('');
  const [vehicleType, setVehicleType] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  const { data: listings, isLoading } = useQuery({
    queryKey: ['vehicle-sales', vehicleType, sortBy],
    queryFn: async () => {
      let query = supabase
        .from('vehicle_sales')
        .select('*')
        .eq('status', 'approved');

      if (vehicleType !== 'all') {
        query = query.eq('vehicle_type', vehicleType);
      }

      switch (sortBy) {
        case 'price_low':
          query = query.order('price', { ascending: true });
          break;
        case 'price_high':
          query = query.order('price', { ascending: false });
          break;
        case 'newest':
        default:
          query = query.order('created_at', { ascending: false });
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  const filteredListings = listings?.filter(listing =>
    listing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    listing.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
    listing.model.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getConditionBadge = (condition: string) => {
    const cond = conditions.find(c => c.value === condition);
    return cond ? (
      <Badge className={`${cond.color} text-white`}>{cond.label}</Badge>
    ) : null;
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <>
      <Helmet>
        <title>Buy Bikes & Buggies | MotoLink Africa Marketplace</title>
        <meta name="description" content="Buy motorcycles, scooters, buggies and ATVs in Kenya. Browse verified listings from private sellers and MotoLink inventory." />
      </Helmet>

      <Navbar />

      <PageHero
        title="BUY &"
        titleHighlight="SELL"
        subtitle="Buy your dream ride from verified sellers across Africa"
        image="/placeholder.svg"
      />

      <main className="py-12">
        <div className="container mx-auto px-4">
          {/* Action Bar */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search by brand, model, or title..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={vehicleType} onValueChange={setVehicleType}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Vehicle Type" />
              </SelectTrigger>
              <SelectContent>
                {vehicleTypes.map(type => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="Sort By" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="price_low">Price: Low to High</SelectItem>
                <SelectItem value="price_high">Price: High to Low</SelectItem>
              </SelectContent>
            </Select>

            <Link to="/sell-vehicle">
              <Button variant="hero" className="w-full md:w-auto">
                <Plus className="w-4 h-4" />
                Sell Your Vehicle
              </Button>
            </Link>
          </div>

          {/* Listings Grid */}
          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <div className="aspect-video bg-muted" />
                  <CardContent className="p-4 space-y-3">
                    <div className="h-6 bg-muted rounded" />
                    <div className="h-4 bg-muted rounded w-2/3" />
                    <div className="h-8 bg-muted rounded w-1/2" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredListings && filteredListings.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredListings.map((listing, index) => (
                <motion.div
                  key={listing.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="group overflow-hidden hover-lift">
                    <div className="aspect-video relative overflow-hidden bg-muted">
                      {listing.images && listing.images[0] ? (
                        <img
                          src={listing.images[0]}
                          alt={listing.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          {listing.vehicle_type === 'buggy' || listing.vehicle_type === 'atv' ? (
                            <Car className="w-16 h-16 text-muted-foreground" />
                          ) : (
                            <Bike className="w-16 h-16 text-muted-foreground" />
                          )}
                        </div>
                      )}
                      <div className="absolute top-3 left-3 flex gap-2">
                        {getConditionBadge(listing.condition)}
                        {listing.listing_type === 'motolink' && (
                          <Badge className="bg-primary text-primary-foreground">MotoLink</Badge>
                        )}
                      </div>
                      {listing.negotiable && (
                        <Badge className="absolute top-3 right-3 bg-accent text-accent-foreground">
                          Negotiable
                        </Badge>
                      )}
                    </div>

                    <CardContent className="p-4">
                      <h3 className="font-display text-xl text-card-foreground mb-1 line-clamp-1">
                        {listing.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        {listing.brand} {listing.model} {listing.year && `• ${listing.year}`}
                      </p>

                      <div className="flex flex-wrap gap-3 text-sm text-muted-foreground mb-4">
                        {listing.mileage && (
                          <span className="flex items-center gap-1">
                            <Gauge className="w-4 h-4" />
                            {listing.mileage.toLocaleString()} km
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {listing.location}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="font-display text-2xl text-primary">
                          {formatPrice(listing.price)}
                        </span>
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <Bike className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-display text-2xl text-foreground mb-2">No Listings Found</h3>
              <p className="text-muted-foreground mb-6">
                {searchQuery ? 'Try adjusting your search terms' : 'Be the first to list your vehicle!'}
              </p>
              <Link to="/sell-vehicle">
                <Button variant="hero">
                  <Plus className="w-4 h-4" />
                  List Your Vehicle
                </Button>
              </Link>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
}