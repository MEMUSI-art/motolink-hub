import { Link } from 'react-router-dom';
import { Bike, Wrench, Gauge, AlertTriangle, ArrowRight, ShoppingBag, MapPin, Package } from 'lucide-react';
import { motion } from 'framer-motion';

const services = [
  {
    icon: Bike,
    title: 'Bike Rental',
    description: 'Premium motorcycles for daily, weekly, or long-term hire. Fully insured and well-maintained.',
    link: '/hire',
    color: 'bg-primary',
  },
  {
    icon: ShoppingBag,
    title: 'Buy & Sell',
    description: 'Marketplace for motorcycles, scooters, buggies & ATVs. Buy from verified sellers or list yours.',
    link: '/marketplace',
    color: 'bg-accent',
  },
  {
    icon: MapPin,
    title: 'Tours & Routes',
    description: 'Book guided motorcycle tours or explore self-guided scenic routes across Africa.',
    link: '/tours',
    color: 'bg-success',
  },
  {
    icon: Wrench,
    title: 'Mechanic Services',
    description: 'Expert technicians for repairs, servicing, and diagnostics. Book appointments online.',
    link: '/mechanic',
    color: 'bg-warning',
  },
  {
    icon: Package,
    title: 'Parts Sourcing',
    description: 'Can\'t find a part? We\'ll source it for you from trusted suppliers across the region.',
    link: '/parts-request',
    color: 'bg-secondary',
  },
  {
    icon: AlertTriangle,
    title: 'SOS Services',
    description: '24/7 emergency roadside assistance, towing, and breakdown support across Africa.',
    link: '/sos',
    color: 'bg-destructive',
  },
];

export default function ServicesSection() {
  return (
    <section className="py-20 bg-muted/50">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <span className="inline-block px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            What We Offer
          </span>
          <h2 className="font-display text-4xl md:text-5xl text-foreground mb-4">
            OUR <span className="text-primary">SERVICES</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            From rental to repairs, MotoLink has everything you need to keep rolling. 
            Experience Africa's most comprehensive motorcycle service platform.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, index) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Link
                to={service.link}
                className="block group bg-card rounded-2xl p-6 shadow-card hover-lift h-full border border-border/50"
              >
                <div className={`w-14 h-14 rounded-xl ${service.color} flex items-center justify-center mb-4 transition-transform group-hover:scale-110`}>
                  <service.icon className="w-7 h-7 text-primary-foreground" />
                </div>
                
                <h3 className="font-display text-2xl text-card-foreground mb-2">
                  {service.title}
                </h3>
                
                <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                  {service.description}
                </p>
                
                <span className="inline-flex items-center gap-2 text-primary font-medium text-sm group-hover:gap-3 transition-all">
                  Learn More <ArrowRight className="w-4 h-4" />
                </span>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
