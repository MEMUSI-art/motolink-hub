import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import PageHero from '@/components/shared/PageHero';
import BookingModal from '@/components/booking/BookingModal';
import BikeAvailabilityCalendar from '@/components/booking/BikeAvailabilityCalendar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Star, Fuel, Gauge, Users, Search, Filter, Calendar, MapPin, CalendarDays } from 'lucide-react';
import { motion } from 'framer-motion';

// Import bike images
import hondaCrf250 from '@/assets/bikes/honda-crf250.jpg';
import yamahaFz from '@/assets/bikes/yamaha-fz.jpg';
import royalEnfield from '@/assets/bikes/royal-enfield.jpg';
import kawasakiNinja from '@/assets/bikes/kawasaki-ninja.jpg';
import tvsApache from '@/assets/bikes/tvs-apache.jpg';
import bajajBoxer from '@/assets/bikes/bajaj-boxer.jpg';

const allBikes = [
  { id: 1, name: 'Honda CRF 250L', category: 'Adventure', price: 25, rating: 4.9, reviews: 124, image: hondaCrf250, specs: { engine: '250cc', power: '24HP', seats: 2 }, available: true },
  { id: 2, name: 'Yamaha FZ S', category: 'Naked', price: 15, rating: 4.8, reviews: 98, image: yamahaFz, specs: { engine: '149cc', power: '13HP', seats: 2 }, available: true },
  { id: 3, name: 'Royal Enfield Bullet 350', category: 'Classic', price: 30, rating: 5.0, reviews: 76, image: royalEnfield, specs: { engine: '346cc', power: '20HP', seats: 2 }, available: false },
  { id: 4, name: 'Kawasaki Ninja 400', category: 'Sport', price: 45, rating: 4.7, reviews: 156, image: kawasakiNinja, specs: { engine: '399cc', power: '49HP', seats: 2 }, available: true },
  { id: 5, name: 'TVS Apache RTR 160', category: 'Sport', price: 12, rating: 4.6, reviews: 89, image: tvsApache, specs: { engine: '159cc', power: '17HP', seats: 2 }, available: true },
  { id: 6, name: 'Bajaj Boxer 150', category: 'Commuter', price: 10, rating: 4.5, reviews: 112, image: bajajBoxer, specs: { engine: '145cc', power: '12HP', seats: 2 }, available: true },
  { id: 7, name: 'Honda CRF 250 Rally', category: 'Adventure', price: 35, rating: 4.8, reviews: 67, image: hondaCrf250, specs: { engine: '250cc', power: '24HP', seats: 2 }, available: true },
  { id: 8, name: 'Yamaha FZ 25', category: 'Naked', price: 22, rating: 4.7, reviews: 134, image: yamahaFz, specs: { engine: '249cc', power: '21HP', seats: 2 }, available: false },
  { id: 9, name: 'TVS Apache RTR 200', category: 'Sport', price: 18, rating: 4.4, reviews: 203, image: tvsApache, specs: { engine: '197cc', power: '20HP', seats: 2 }, available: true },
  { id: 10, name: 'Kawasaki Ninja 650', category: 'Sport', price: 65, rating: 4.9, reviews: 178, image: kawasakiNinja, specs: { engine: '649cc', power: '68HP', seats: 2 }, available: true },
];

const categories = ['All', 'Adventure', 'Sport', 'Naked', 'Classic', 'Commuter'];

export default function Hire() {
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('All');
  const [priceRange, setPriceRange] = useState([0, 100]);
  const [pickupDate, setPickupDate] = useState('');
  const [location, setLocation] = useState('');
  const [selectedBike, setSelectedBike] = useState<typeof allBikes[0] | null>(null);
  const [isBookingOpen, setIsBookingOpen] = useState(false);

  const filteredBikes = allBikes.filter(bike => {
    const matchesSearch = bike.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = category === 'All' || bike.category === category;
    const matchesPrice = bike.price >= priceRange[0] && bike.price <= priceRange[1];
    return matchesSearch && matchesCategory && matchesPrice;
  });

  const handleBooking = (bike: typeof allBikes[0]) => {
    setSelectedBike(bike);
    setIsBookingOpen(true);
  };

  return (
    <>
      <Helmet>
        <title>Hire a Motorcycle | MotoLink Africa</title>
        <meta name="description" content="Browse and book premium motorcycles for daily, weekly, or long-term hire across Africa. Fully insured and well-maintained fleet." />
      </Helmet>

      <Navbar />
      
      <main className="pt-20 min-h-screen bg-background">
        {/* Hero with Image */}
        <PageHero
          title="HIRE A"
          titleHighlight="BIKE"
          subtitle="Choose from our premium fleet of well-maintained motorcycles. All rentals include insurance, helmet, and 24/7 roadside assistance."
          image="https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=1920&q=80"
        >
          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-8 bg-card/95 backdrop-blur-sm rounded-2xl p-6 shadow-card"
          >
            <div className="grid md:grid-cols-4 gap-4">
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder="Pickup location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="date"
                  value={pickupDate}
                  onChange={(e) => setPickupDate(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder="Search bikes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button variant="hero" className="w-full">
                <Search className="w-5 h-5" />
                Search Bikes
              </Button>
            </div>
          </motion.div>
        </PageHero>

        {/* Bikes Listing */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Filters Sidebar */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="lg:w-64 shrink-0"
              >
                <div className="bg-card rounded-xl p-6 shadow-card sticky top-24">
                  <div className="flex items-center gap-2 mb-6">
                    <Filter className="w-5 h-5 text-primary" />
                    <h3 className="font-display text-xl">FILTERS</h3>
                  </div>

                  {/* Category */}
                  <div className="mb-6">
                    <label className="text-sm font-medium mb-2 block">Category</label>
                    <Select value={category} onValueChange={setCategory}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map(cat => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Price Range */}
                  <div className="mb-6">
                    <label className="text-sm font-medium mb-4 block">
                      Price: ${priceRange[0]} - ${priceRange[1]}/day
                    </label>
                    <Slider
                      value={priceRange}
                      onValueChange={setPriceRange}
                      min={0}
                      max={100}
                      step={5}
                      className="mt-2"
                    />
                  </div>

                  <Button variant="outline" className="w-full" onClick={() => {
                    setCategory('All');
                    setPriceRange([0, 100]);
                    setSearchTerm('');
                  }}>
                    Clear Filters
                  </Button>
                </div>
              </motion.div>

              {/* Bikes Grid */}
              <div className="flex-1">
                <div className="flex items-center justify-between mb-6">
                  <p className="text-muted-foreground">
                    Showing <span className="font-semibold text-foreground">{filteredBikes.length}</span> bikes
                  </p>
                </div>

                <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {filteredBikes.map((bike, index) => (
                    <motion.div
                      key={bike.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Card className="group overflow-hidden hover-lift bg-card border-border/50">
                        <div className="relative overflow-hidden">
                          <img
                            src={bike.image}
                            alt={bike.name}
                            className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-110"
                          />
                          <Badge className={`absolute top-3 right-3 ${bike.available ? 'bg-success' : 'bg-destructive'}`}>
                            {bike.available ? 'Available' : 'Booked'}
                          </Badge>
                          <div className="absolute top-3 left-3 bg-secondary/90 px-2 py-1 rounded text-xs text-secondary-foreground">
                            {bike.category}
                          </div>
                        </div>
                        
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-semibold text-lg">{bike.name}</h3>
                            <div className="flex items-center gap-1 text-accent">
                              <Star className="w-4 h-4 fill-accent" />
                              <span className="text-sm font-medium">{bike.rating}</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                            <div className="flex items-center gap-1">
                              <Fuel className="w-4 h-4" />
                              <span>{bike.specs.engine}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Gauge className="w-4 h-4" />
                              <span>{bike.specs.power}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Users className="w-4 h-4" />
                              <span>{bike.specs.seats}</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="text-2xl font-bold text-primary">${bike.price}</span>
                              <span className="text-muted-foreground text-sm">/day</span>
                            </div>
                            <Button 
                              size="sm" 
                              disabled={!bike.available}
                              onClick={() => handleBooking(bike)}
                            >
                              Book Now
                            </Button>
                            <Sheet>
                              <SheetTrigger asChild>
                                <Button variant="outline" size="icon" className="shrink-0">
                                  <CalendarDays className="w-4 h-4" />
                                </Button>
                              </SheetTrigger>
                              <SheetContent>
                                <SheetHeader>
                                  <SheetTitle>Bike Availability</SheetTitle>
                                </SheetHeader>
                                <div className="mt-6">
                                  <BikeAvailabilityCalendar bikeName={bike.name} />
                                </div>
                              </SheetContent>
                            </Sheet>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>

                {filteredBikes.length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">No bikes match your filters. Try adjusting your search.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Booking Modal */}
      {selectedBike && (
        <BookingModal
          isOpen={isBookingOpen}
          onClose={() => setIsBookingOpen(false)}
          bike={selectedBike}
        />
      )}

      <Footer />
    </>
  );
}
