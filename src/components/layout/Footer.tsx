import { Link } from 'react-router-dom';
import { Bike, Facebook, Instagram, Twitter, Youtube, Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-secondary text-secondary-foreground">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-full gradient-hero flex items-center justify-center">
                <Bike className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="font-display text-2xl tracking-wider">
                MOTO<span className="text-primary">LINK</span>
              </span>
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Africa's premier motorcycle rental and services platform. Ride with confidence, backed by professional mechanics and 24/7 support.
            </p>
            <div className="flex gap-3 mt-4">
              <a href="#" className="w-10 h-10 rounded-full bg-muted/20 flex items-center justify-center hover:bg-primary transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-muted/20 flex items-center justify-center hover:bg-primary transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-muted/20 flex items-center justify-center hover:bg-primary transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-muted/20 flex items-center justify-center hover:bg-primary transition-colors">
                <Youtube className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-display text-xl mb-4 text-primary">QUICK LINKS</h3>
            <ul className="space-y-2">
              <li><Link to="/hire" className="text-muted-foreground hover:text-primary transition-colors">Hire a Bike</Link></li>
              <li><Link to="/mechanic" className="text-muted-foreground hover:text-primary transition-colors">Mechanic Services</Link></li>
              <li><Link to="/garage" className="text-muted-foreground hover:text-primary transition-colors">My Garage</Link></li>
              <li><Link to="/sos" className="text-muted-foreground hover:text-primary transition-colors">SOS Services</Link></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">About Us</a></li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="font-display text-xl mb-4 text-primary">SERVICES</h3>
            <ul className="space-y-2">
              <li className="text-muted-foreground">Daily & Weekly Rentals</li>
              <li className="text-muted-foreground">Long-term Leasing</li>
              <li className="text-muted-foreground">Full Service Repairs</li>
              <li className="text-muted-foreground">Custom Modifications</li>
              <li className="text-muted-foreground">Emergency Roadside Help</li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-display text-xl mb-4 text-primary">CONTACT US</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-muted-foreground">
                <MapPin className="w-5 h-5 text-primary" />
                <span>Nairobi, Kenya</span>
              </li>
              <li className="flex items-center gap-3 text-muted-foreground">
                <Phone className="w-5 h-5 text-primary" />
                <span>+254 700 123 456</span>
              </li>
              <li className="flex items-center gap-3 text-muted-foreground">
                <Mail className="w-5 h-5 text-primary" />
                <span>info@motolink.africa</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border/20 mt-8 pt-8 text-center text-muted-foreground text-sm">
          <p>© {new Date().getFullYear()} MotoLink Africa. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
