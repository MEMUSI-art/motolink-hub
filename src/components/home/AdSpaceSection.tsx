import { motion } from 'framer-motion';
import { ExternalLink, Shield, Wrench, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface AdSlot {
  id: string;
  title: string;
  description: string;
  image: string;
  link: string;
  sponsor: string;
  category: 'gear' | 'accessories' | 'insurance' | 'service';
}

const adSlots: AdSlot[] = [
  {
    id: '1',
    title: 'RAD 254 Riding School',
    description: 'Professional motorcycle training in Nairobi. Learn from certified instructors.',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop',
    link: 'https://rad254.co.ke',
    sponsor: 'RAD 254',
    category: 'gear'
  },
  {
    id: '2',
    title: 'Jubilee Motorcycle Insurance',
    description: 'Comprehensive coverage from Kenya\'s leading insurer. Get a quote online.',
    image: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=400&h=300&fit=crop',
    link: 'https://www.jubileeinsurance.com/ke/motor-insurance',
    sponsor: 'Jubilee Insurance',
    category: 'insurance'
  },
  {
    id: '3',
    title: 'Helmet Hub Kenya',
    description: 'Premium helmets & riding gear. DOT certified. Free delivery in Nairobi.',
    image: 'https://images.unsplash.com/photo-1591637333184-19aa84b3e01f?w=400&h=300&fit=crop',
    link: 'https://helmethub.co.ke',
    sponsor: 'Helmet Hub',
    category: 'accessories'
  },
  {
    id: '4',
    title: 'Bike Parts Kenya',
    description: 'Genuine spare parts for all major brands. Same-day delivery in Nairobi.',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop',
    link: 'https://bikeparts.co.ke',
    sponsor: 'Bike Parts Kenya',
    category: 'service'
  }
];

const categoryIcons = {
  gear: Shield,
  accessories: ShoppingBag,
  insurance: Shield,
  service: Wrench
};

const AdSpaceSection = () => {
  return (
    <section className="py-20 bg-gradient-to-br from-muted/30 to-background">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <Badge variant="outline" className="mb-4 border-primary/50 text-primary">
            Featured Partners
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Gear Up for Your <span className="text-primary">Next Ride</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Shop quality motorcycle gear, accessories, and services from our trusted partners
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {adSlots.map((ad, index) => {
            const Icon = categoryIcons[ad.category];
            return (
              <motion.div
                key={ad.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="group overflow-hidden hover:shadow-xl transition-all duration-300 border-border/50 hover:border-primary/30 h-full">
                  <div className="relative h-40 overflow-hidden">
                    <img
                      src={ad.image}
                      alt={ad.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
                    <Badge className="absolute top-3 left-3 bg-primary/90">
                      <Icon className="w-3 h-3 mr-1" />
                      Sponsored
                    </Badge>
                  </div>
                  <CardContent className="p-4">
                    <p className="text-xs text-muted-foreground mb-1">{ad.sponsor}</p>
                    <h3 className="font-semibold mb-2 line-clamp-1">{ad.title}</h3>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {ad.description}
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                      asChild
                    >
                      <a href={ad.link} target="_blank" rel="noopener noreferrer">
                        Learn More <ExternalLink className="w-3 h-3 ml-2" />
                      </a>
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-12 text-center"
        >
          <p className="text-sm text-muted-foreground mb-4">
            Want to advertise with MotoLink Africa?
          </p>
          <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground">
            Become a Partner
          </Button>
        </motion.div>
      </div>
    </section>
  );
};

export default AdSpaceSection;
