import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Bike, Wrench, Shield, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const heroSlides = [
  {
    id: 1,
    title: 'RIDE WITH',
    highlight: 'CONFIDENCE',
    subtitle: 'Rent premium motorcycles, access expert mechanics, and customize your ride. MotoLink connects you to everything two-wheeled across Africa.',
    image: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=1920&q=80',
    cta: { text: 'Hire a Bike', link: '/hire', icon: Bike },
  },
  {
    id: 2,
    title: 'EXPERT',
    highlight: 'MECHANICS',
    subtitle: 'Certified professionals ready to service, repair, and maintain your motorcycle. Quality parts and transparent pricing.',
    image: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=1920&q=80',
    cta: { text: 'Find Mechanic', link: '/mechanic', icon: Wrench },
  },
  {
    id: 3,
    title: 'CUSTOM',
    highlight: 'BUILDS',
    subtitle: 'Transform your ride with performance upgrades, custom paint, and personalized modifications at our state-of-the-art garage.',
    image: 'https://images.unsplash.com/photo-1609630875171-b1321377ee65?w=1920&q=80',
    cta: { text: 'My Garage', link: '/garage', icon: Wrench },
  },
  {
    id: 4,
    title: '24/7 SOS',
    highlight: 'RESCUE',
    subtitle: 'Breakdown? Accident? Our emergency response team is always ready. One call and we\'re on our way, anywhere in Kenya.',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1920&q=80',
    cta: { text: 'SOS Services', link: '/sos', icon: Shield },
  },
];

export default function HeroSection() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    if (!isAutoPlaying) return;
    
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [isAutoPlaying]);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const slide = heroSlides[currentSlide];
  const CtaIcon = slide.cta.icon;

  return (
    <section className="relative min-h-screen flex items-center pt-20 overflow-hidden">
      {/* Background Slideshow */}
      <AnimatePresence mode="wait">
        <motion.div
          key={slide.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7 }}
          className="absolute inset-0"
        >
          <div className="absolute inset-0 gradient-dark" />
          <div 
            className="absolute inset-0 opacity-40"
            style={{
              backgroundImage: `url('${slide.image}')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-secondary via-secondary/80 to-transparent" />
        </motion.div>
      </AnimatePresence>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={slide.id}
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              transition={{ duration: 0.5 }}
            >
              <span className="inline-block px-4 py-2 rounded-full bg-primary/20 text-primary text-sm font-medium mb-6">
                🏍️ Africa's #1 Motorcycle Platform
              </span>
              
              <h1 className="font-display text-5xl md:text-7xl lg:text-8xl text-primary-foreground leading-none mb-6">
                {slide.title}
                <span className="block text-gradient">{slide.highlight}</span>
              </h1>
              
              <p className="text-lg text-muted-foreground max-w-xl mb-8 leading-relaxed">
                {slide.subtitle}
              </p>

              <div className="flex flex-wrap gap-4">
                <Link to={slide.cta.link}>
                  <Button variant="hero" size="xl">
                    <CtaIcon className="w-5 h-5" />
                    {slide.cta.text}
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                </Link>
                <Link to="/hire">
                  <Button variant="outline" size="xl" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10">
                    <Bike className="w-5 h-5" />
                    Browse Bikes
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
          </AnimatePresence>

          {/* Hero Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="hidden lg:block relative"
          >
            <div className="relative">
              <AnimatePresence mode="wait">
                <motion.img
                  key={slide.id}
                  src={slide.image}
                  alt="Premium Motorcycle"
                  initial={{ opacity: 0, scale: 1.1 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.5 }}
                  className="w-full rounded-2xl shadow-2xl"
                />
              </AnimatePresence>
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

      {/* Slide Navigation */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 z-20">
        <button 
          onClick={prevSlide}
          className="w-10 h-10 rounded-full bg-primary-foreground/10 hover:bg-primary-foreground/20 flex items-center justify-center transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-primary-foreground" />
        </button>
        
        <div className="flex gap-2">
          {heroSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === currentSlide 
                  ? 'w-8 bg-primary' 
                  : 'w-2 bg-primary-foreground/30 hover:bg-primary-foreground/50'
              }`}
            />
          ))}
        </div>
        
        <button 
          onClick={nextSlide}
          className="w-10 h-10 rounded-full bg-primary-foreground/10 hover:bg-primary-foreground/20 flex items-center justify-center transition-colors"
        >
          <ChevronRight className="w-5 h-5 text-primary-foreground" />
        </button>
      </div>
    </section>
  );
}
