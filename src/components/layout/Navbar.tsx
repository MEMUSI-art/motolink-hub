import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Bike, Wrench, Gauge, AlertTriangle, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import Logo from '@/components/shared/Logo';

const navLinks = [
  { name: 'Home', path: '/', icon: null },
  { name: 'Hire a Bike', path: '/hire', icon: Bike },
  { name: 'Mechanic Services', path: '/mechanic', icon: Wrench },
  { name: 'My Garage', path: '/garage', icon: Gauge },
  { name: 'SOS', path: '/sos', icon: AlertTriangle },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-secondary/95 backdrop-blur-md border-b border-border/20">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Logo />

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 flex items-center gap-2 ${
                  location.pathname === link.path
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-primary-foreground hover:bg-secondary/50'
                }`}
              >
                {link.icon && <link.icon className="w-4 h-4" />}
                {link.name}
              </Link>
            ))}
          </div>

          {/* CTA Button */}
          <div className="hidden md:flex items-center gap-3">
            <Button variant="outline" size="sm" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground">
              <Phone className="w-4 h-4" />
              Contact Us
            </Button>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 text-primary-foreground"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-secondary border-t border-border/20"
          >
            <div className="container mx-auto px-4 py-4 space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className={`block px-4 py-3 rounded-lg font-medium transition-all duration-300 flex items-center gap-3 ${
                    location.pathname === link.path
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-primary-foreground hover:bg-secondary/50'
                  }`}
                >
                  {link.icon && <link.icon className="w-5 h-5" />}
                  {link.name}
                </Link>
              ))}
              <Button variant="outline" className="w-full mt-4 border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                <Phone className="w-4 h-4" />
                Contact Us
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
