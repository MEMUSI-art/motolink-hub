import { Star, Quote } from 'lucide-react';
import { motion } from 'framer-motion';

const testimonials = [
  {
    id: 1,
    name: 'James Ochieng',
    location: 'Nairobi, Kenya',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80',
    rating: 5,
    text: 'MotoLink made my safari adventure unforgettable! The BMW GS was in perfect condition and the booking was seamless. Highly recommend!',
  },
  {
    id: 2,
    name: 'Amara Diallo',
    location: 'Accra, Ghana',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80',
    rating: 5,
    text: 'The mechanic service saved me when I broke down in the middle of nowhere. 30 minutes and they were there. Amazing 24/7 support!',
  },
  {
    id: 3,
    name: 'Kofi Mensah',
    location: 'Lagos, Nigeria',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&q=80',
    rating: 5,
    text: 'Got my bike customized at My Garage. The attention to detail and fair KES pricing made it worth every shilling. Best mods in Africa!',
  },
];

export default function TestimonialsSection() {
  return (
    <section className="py-20 bg-secondary">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <span className="inline-block px-4 py-2 rounded-full bg-primary/20 text-primary text-sm font-medium mb-4">
            Testimonials
          </span>
          <h2 className="font-display text-4xl md:text-5xl text-secondary-foreground mb-4">
            RIDER <span className="text-primary">STORIES</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Hear from our community of riders across Africa who trust MotoLink for their motorcycle needs.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-card rounded-2xl p-6 shadow-card relative"
            >
              <Quote className="absolute top-4 right-4 w-8 h-8 text-primary/20" />
              
              <div className="flex items-center gap-3 mb-4">
                <img
                  src={testimonial.avatar}
                  alt={testimonial.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <h4 className="font-semibold text-card-foreground">{testimonial.name}</h4>
                  <p className="text-sm text-muted-foreground">{testimonial.location}</p>
                </div>
              </div>
              
              <div className="flex gap-1 mb-3">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-accent text-accent" />
                ))}
              </div>
              
              <p className="text-muted-foreground text-sm leading-relaxed">
                "{testimonial.text}"
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
