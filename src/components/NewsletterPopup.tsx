import { useState, useEffect } from 'react';
import { X, Mail, Bike, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export default function NewsletterPopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const hasSeenPopup = localStorage.getItem('motolink-newsletter-seen');
    if (!hasSeenPopup) {
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    localStorage.setItem('motolink-newsletter-seen', 'true');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('newsletter_subscribers')
        .insert({ email, name: name || null });

      if (error) {
        if (error.code === '23505') {
          toast.info('You\'re already subscribed!');
        } else {
          throw error;
        }
      } else {
        toast.success('Welcome to MotoLink! Check your inbox for exclusive deals.');
      }
      handleClose();
    } catch (error) {
      console.error('Newsletter signup error:', error);
      toast.error('Failed to subscribe. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-foreground/50 backdrop-blur-sm"
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="relative w-full max-w-md bg-card rounded-2xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-muted hover:bg-muted/80 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="gradient-hero p-6 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary-foreground/20 flex items-center justify-center">
                <Bike className="w-8 h-8 text-primary-foreground" />
              </div>
              <h2 className="font-display text-3xl text-primary-foreground mb-2">
                JOIN THE RIDE!
              </h2>
              <p className="text-primary-foreground/90 text-sm">
                Get exclusive deals, new bike alerts & riding tips
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6">
              <div className="flex flex-col gap-4">
                <Input
                  type="text"
                  placeholder="Your name (optional)"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-12"
                  disabled={isSubmitting}
                />
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 h-12"
                    required
                    disabled={isSubmitting}
                  />
                </div>
                <Button type="submit" variant="hero" size="lg" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Subscribing...
                    </>
                  ) : (
                    'Subscribe Now'
                  )}
                </Button>
                <p className="text-center text-xs text-muted-foreground">
                  No spam, just the good stuff. Unsubscribe anytime.
                </p>
              </div>
            </form>

            {/* Decorative */}
            <div className="absolute -bottom-10 -right-10 w-32 h-32 rounded-full bg-primary/10 blur-2xl" />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
