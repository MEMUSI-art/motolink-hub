import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, Fuel, Gauge, Users, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const featuredBikes = [
  {
    id: 1,
    name: 'Honda CB500X',
    category: 'Adventure',
    price: 45,
    rating: 4.9,
    reviews: 124,
    image: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=600&q=80',
    specs: { engine: '471cc', power: '47HP', seats: 2 },
    available: true,
  },
  {
    id: 2,
    name: 'Yamaha MT-07',
    category: 'Naked',
    price: 55,
    rating: 4.8,
    reviews: 98,
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80',
    specs: { engine: '689cc', power: '74HP', seats: 2 },
    available: true,
  },
  {
    id: 3,
    name: 'BMW R1250GS',
    category: 'Adventure',
    price: 85,
    rating: 5.0,
    reviews: 76,
    image: 'https://images.unsplash.com/photo-1591637333184-19aa84b3e01f?w=600&q=80',
    specs: { engine: '1254cc', power: '136HP', seats: 2 },
    available: false,
  },
  {
    id: 4,
    name: 'Kawasaki Ninja 400',
    category: 'Sport',
    price: 40,
    rating: 4.7,
    reviews: 156,
    image: 'https://images.unsplash.com/photo-1449426468159-d96dbf08f19f?w=600&q=80',
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
