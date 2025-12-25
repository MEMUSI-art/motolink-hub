import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, Fuel, Gauge, Users, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

// Import bike images
import hondaCrf250 from '@/assets/bikes/honda-crf250.jpg';
import yamahaFz from '@/assets/bikes/yamaha-fz.jpg';
import royalEnfield from '@/assets/bikes/royal-enfield.jpg';
import kawasakiNinja from '@/assets/bikes/kawasaki-ninja.jpg';

const featuredBikes = [
  {
    id: 1,
    name: 'Honda CRF 250L',
    category: 'Adventure',
    price: 25,
    rating: 4.9,
    reviews: 124,
    image: hondaCrf250,
    specs: { engine: '250cc', power: '24HP', seats: 2 },
    available: true,
  },
  {
    id: 2,
    name: 'Yamaha FZ S',
    category: 'Naked',
    price: 15,
    rating: 4.8,
    reviews: 98,
    image: yamahaFz,
    specs: { engine: '149cc', power: '13HP', seats: 2 },
    available: true,
  },
  {
    id: 3,
    name: 'Royal Enfield Bullet 350',
    category: 'Classic',
    price: 30,
    rating: 5.0,
    reviews: 76,
    image: royalEnfield,
    specs: { engine: '346cc', power: '20HP', seats: 2 },
    available: false,
  },
  {
    id: 4,
    name: 'Kawasaki Ninja 400',
    category: 'Sport',
    price: 45,
    rating: 4.7,
    reviews: 156,
    image: kawasakiNinja,
    specs: { engine: '399cc', power: '49HP', seats: 2 },
    available: true,
  },
];

export default function FeaturedBikes() {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <span className="inline-block px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            Our Fleet
          </span>
          <h2 className="font-display text-4xl md:text-5xl text-foreground mb-4">
            FEATURED <span className="text-primary">BIKES</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Choose from our premium selection of well-maintained motorcycles, 
            perfect for city commutes or cross-country adventures.
          </p>
        </div>

        {/* Bikes Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredBikes.map((bike, index) => (
            <motion.div
              key={bike.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="group overflow-hidden hover-lift bg-card border-border/50">
                <div className="relative overflow-hidden">
                  <img
                    src={bike.image}
                    alt={bike.name}
                    className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <Badge 
                    className={`absolute top-3 right-3 ${
                      bike.available 
                        ? 'bg-success text-success-foreground' 
                        : 'bg-destructive text-destructive-foreground'
                    }`}
                  >
                    {bike.available ? 'Available' : 'Booked'}
                  </Badge>
                  <div className="absolute top-3 left-3 bg-secondary/90 px-2 py-1 rounded text-xs text-secondary-foreground">
                    {bike.category}
                  </div>
                </div>
                
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-lg text-card-foreground">{bike.name}</h3>
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
                    <Button size="sm" disabled={!bike.available}>
                      Book Now
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* View All */}
        <div className="text-center mt-10">
          <Link to="/hire">
            <Button variant="outline" size="lg">
              View All Bikes
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
