import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface PageHeroProps {
  title: string;
  titleHighlight: string;
  subtitle: string;
  image: string;
  icon?: LucideIcon;
  variant?: 'default' | 'destructive';
  children?: React.ReactNode;
}

export default function PageHero({
  title,
  titleHighlight,
  subtitle,
  image,
  icon: Icon,
  variant = 'default',
  children,
}: PageHeroProps) {
  const isDestructive = variant === 'destructive';
  
  return (
    <section className="relative min-h-[40vh] flex items-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src={image}
          alt={`${title} ${titleHighlight}`}
          className="w-full h-full object-cover"
        />
        <div className={`absolute inset-0 ${
          isDestructive 
            ? 'bg-gradient-to-r from-destructive/90 via-destructive/70 to-secondary/80' 
            : 'bg-gradient-to-r from-secondary/95 via-secondary/80 to-secondary/60'
        }`} />
      </div>
      
      {/* Content */}
      <div className="container mx-auto px-4 relative z-10 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-3xl"
        >
          {Icon && (
            <div className={`w-16 h-16 rounded-full ${
              isDestructive ? 'bg-destructive-foreground/20' : 'bg-primary/20'
            } flex items-center justify-center mb-6`}>
              <Icon className={`w-8 h-8 ${isDestructive ? 'text-destructive-foreground' : 'text-primary'}`} />
            </div>
          )}
          
          <h1 className="font-display text-4xl md:text-6xl lg:text-7xl text-secondary-foreground mb-4">
            {title} <span className={isDestructive ? 'text-destructive-foreground' : 'text-primary'}>{titleHighlight}</span>
          </h1>
          
          <p className="text-lg md:text-xl text-secondary-foreground/80 max-w-2xl">
            {subtitle}
          </p>
          
          {children}
        </motion.div>
      </div>
    </section>
  );
}
