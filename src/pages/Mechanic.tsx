import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Wrench, Clock, Shield, Star, MapPin, Phone, CheckCircle, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

const services = [
  { id: 1, name: 'Full Service', price: 5000, duration: '3-4 hours', description: 'Complete inspection, oil change, filter replacement, brake check, and chain adjustment.' },
  { id: 2, name: 'Oil Change', price: 800, duration: '30 mins', description: 'Fresh oil and filter replacement with quality synthetic oil.' },
  { id: 3, name: 'Brake Service', price: 2500, duration: '1-2 hours', description: 'Brake pad replacement, fluid check, and rotor inspection.' },
  { id: 4, name: 'Tire Change', price: 1500, duration: '45 mins', description: 'Remove and replace tires, balance wheels, check pressure.' },
  { id: 5, name: 'Chain & Sprocket', price: 3500, duration: '1 hour', description: 'Chain replacement, sprocket inspection, proper tensioning.' },
  { id: 6, name: 'Electrical Diagnosis', price: 1200, duration: '1 hour', description: 'Battery test, wiring inspection, lighting check, starter diagnosis.' },
  { id: 7, name: 'Puncture Repair', price: 500, duration: '20 mins', description: 'Quick tube or tubeless tire puncture repair.' },
  { id: 8, name: 'Engine Tune-Up', price: 3000, duration: '2-3 hours', description: 'Carburetor cleaning, spark plug replacement, valve adjustment.' },
];

const mechanics = [
  { id: 1, name: 'Joseph Kamau', specialty: 'Japanese Bikes', rating: 4.9, reviews: 156, image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80', location: 'Nairobi CBD' },
  { id: 2, name: 'Peter Omondi', specialty: 'Adventure & Touring', rating: 4.8, reviews: 124, image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&q=80', location: 'Westlands' },
  { id: 3, name: 'Samuel Njoroge', specialty: 'Sport Bikes', rating: 4.9, reviews: 98, image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80', location: 'Kilimani' },
];

export default function Mechanic() {
  const [selectedService, setSelectedService] = useState('');
  const [bookingData, setBookingData] = useState({
    name: '',
    phone: '',
    bike: '',
    date: '',
    notes: '',
  });

  const handleBooking = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Service appointment booked! Our mechanic will contact you to confirm.');
  };

  return (
    <>
      <Helmet>
        <title>Mechanic Services | MotoLink Africa</title>
        <meta name="description" content="Expert motorcycle repair and maintenance services. Book appointments with certified mechanics across Africa." />
      </Helmet>

      <Navbar />

      <main className="pt-20 min-h-screen bg-background">
        {/* Hero */}
        <section className="bg-secondary py-16">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <h1 className="font-display text-4xl md:text-6xl text-secondary-foreground mb-4">
                MECHANIC <span className="text-primary">SERVICES</span>
              </h1>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Expert technicians for all your motorcycle repair and maintenance needs. Certified mechanics, genuine parts, and transparent pricing.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Features */}
        <section className="py-12 bg-muted/50">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-4 gap-6">
              {[
                { icon: Wrench, title: 'Expert Mechanics', desc: 'Certified professionals' },
                { icon: Shield, title: 'Genuine Parts', desc: 'OEM & quality aftermarket' },
                { icon: Clock, title: 'Quick Service', desc: 'Same-day appointments' },
                { icon: CheckCircle, title: '90-Day Warranty', desc: 'On all repairs' },
              ].map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center gap-4 bg-card p-4 rounded-xl"
                >
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Services & Booking */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Services List */}
              <div className="lg:col-span-2">
                <h2 className="font-display text-3xl mb-6">OUR <span className="text-primary">SERVICES</span></h2>
                <div className="grid md:grid-cols-2 gap-4">
                  {services.map((service, index) => (
                    <motion.div
                      key={service.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Card 
                        className={`cursor-pointer transition-all hover-lift ${selectedService === service.name ? 'ring-2 ring-primary' : ''}`}
                        onClick={() => setSelectedService(service.name)}
                      >
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="font-semibold text-lg">{service.name}</h3>
                            <span className="text-xl font-bold text-primary">KES {service.price.toLocaleString()}</span>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{service.description}</p>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Clock className="w-4 h-4" />
                            <span>{service.duration}</span>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>

                {/* Mechanics */}
                <h2 className="font-display text-3xl mt-12 mb-6">TOP <span className="text-primary">MECHANICS</span></h2>
                <div className="grid md:grid-cols-3 gap-4">
                  {mechanics.map((mechanic, index) => (
                    <motion.div
                      key={mechanic.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card className="text-center p-4 hover-lift">
                        <img
                          src={mechanic.image}
                          alt={mechanic.name}
                          className="w-20 h-20 rounded-full mx-auto mb-3 object-cover"
                        />
                        <h3 className="font-semibold">{mechanic.name}</h3>
                        <p className="text-sm text-primary">{mechanic.specialty}</p>
                        <div className="flex items-center justify-center gap-1 mt-2">
                          <Star className="w-4 h-4 fill-accent text-accent" />
                          <span className="text-sm font-medium">{mechanic.rating}</span>
                          <span className="text-sm text-muted-foreground">({mechanic.reviews})</span>
                        </div>
                        <div className="flex items-center justify-center gap-1 mt-1 text-sm text-muted-foreground">
                          <MapPin className="w-3 h-3" />
                          <span>{mechanic.location}</span>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Booking Form */}
              <div>
                <Card className="sticky top-24">
                  <CardHeader>
                    <CardTitle className="font-display text-2xl">BOOK SERVICE</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleBooking} className="space-y-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block">Service Type</label>
                        <Select value={selectedService} onValueChange={setSelectedService}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a service" />
                          </SelectTrigger>
                          <SelectContent>
                            {services.map(s => (
                              <SelectItem key={s.id} value={s.name}>{s.name} - KES {s.price.toLocaleString()}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <label className="text-sm font-medium mb-2 block">Your Name</label>
                        <Input
                          value={bookingData.name}
                          onChange={(e) => setBookingData({ ...bookingData, name: e.target.value })}
                          placeholder="John Doe"
                          required
                        />
                      </div>

                      <div>
                        <label className="text-sm font-medium mb-2 block">Phone Number</label>
                        <Input
                          value={bookingData.phone}
                          onChange={(e) => setBookingData({ ...bookingData, phone: e.target.value })}
                          placeholder="+254 700 123 456"
                          required
                        />
                      </div>

                      <div>
                        <label className="text-sm font-medium mb-2 block">Motorcycle</label>
                        <Input
                          value={bookingData.bike}
                          onChange={(e) => setBookingData({ ...bookingData, bike: e.target.value })}
                          placeholder="e.g., Honda CB500X 2022"
                          required
                        />
                      </div>

                      <div>
                        <label className="text-sm font-medium mb-2 block">Preferred Date</label>
                        <div className="relative">
                          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            type="date"
                            value={bookingData.date}
                            onChange={(e) => setBookingData({ ...bookingData, date: e.target.value })}
                            className="pl-10"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-sm font-medium mb-2 block">Additional Notes</label>
                        <Textarea
                          value={bookingData.notes}
                          onChange={(e) => setBookingData({ ...bookingData, notes: e.target.value })}
                          placeholder="Describe any issues..."
                          rows={3}
                        />
                      </div>

                      <Button type="submit" variant="hero" className="w-full">
                        <Wrench className="w-5 h-5" />
                        Book Appointment
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
