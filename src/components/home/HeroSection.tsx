import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Bike, Wrench, Shield, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center pt-20 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 gradient-dark" />
      <div 
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=1920&q=80')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-secondary via-secondary/80 to-transparent" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="inline-block px-4 py-2 rounded-full bg-primary/20 text-primary text-sm font-medium mb-6">
              🏍️ Africa's #1 Motorcycle Platform
            </span>
            
            <h1 className="font-display text-5xl md:text-7xl lg:text-8xl text-primary-foreground leading-none mb-6">
              RIDE WITH
              <span className="block text-gradient">CONFIDENCE</span>
            </h1>
            
            <p className="text-lg text-muted-foreground max-w-xl mb-8 leading-relaxed">
              Rent premium motorcycles, access expert mechanics, and customize your ride. 
              MotoLink connects you to everything two-wheeled across Africa.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link to="/hire">
                <Button variant="hero" size="xl">
                  <Bike className="w-5 h-5" />
                  Hire a Bike
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <Link to="/mechanic">
                <Button variant="outline" size="xl" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10">
                  <Wrench className="w-5 h-5" />
                  Find a Mechanic
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 mt-12 pt-12 border-t border-primary-foreground/10">
              <div>
                <p className="font-display text-4xl text-primary">500+</p>
                <p className="text-muted-foreground text-sm">Bikes Available</p>
              </div>
              <div>
                <p className="font-display text-4xl text-primary">50+</p>
                <p className="text-muted-foreground text-sm">Expert Mechanics</p>
              </div>
              <div>
                <p className="font-display text-4xl text-primary">24/7</p>
                <p className="text-muted-foreground text-sm">SOS Support</p>
              </div>
            </div>
          </motion.div>

          {/* Hero Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="hidden lg:block relative"
          >
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1609630875171-b1321377ee65?w=800&q=80"
                alt="Premium Motorcycle"
                className="w-full rounded-2xl shadow-2xl"
              />
              <div className="absolute -bottom-6 -left-6 bg-card p-4 rounded-xl shadow-lg flex items-center gap-3">
                <div className="w-12 h-12 rounded-full gradient-hero flex items-center justify-center">
                  <Shield className="w-6 h-6 text-primary-foreground" />
                </div>
                <div>
                  <p className="font-semibold text-card-foreground">Fully Insured</p>
                  <p className="text-sm text-muted-foreground">Ride worry-free</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <div className="w-6 h-10 rounded-full border-2 border-primary-foreground/30 flex justify-center pt-2">
          <motion.div
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-1.5 h-1.5 rounded-full bg-primary"
          />
        </div>
      </motion.div>
    </section>
  );
}
