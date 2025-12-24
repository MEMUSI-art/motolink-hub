import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import PageHero from '@/components/shared/PageHero';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Gauge, Paintbrush, Volume2, Cog, Zap, Shield, Star, Clock, Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

const modCategories = [
  {
    id: 'performance',
    name: 'Performance',
    icon: Gauge,
    mods: [
      { name: 'Exhaust System Upgrade', price: 45000, priceUSD: 350, duration: '2-3 hours', popular: true },
      { name: 'Air Filter & Intake', price: 12000, priceUSD: 95, duration: '1 hour', popular: false },
      { name: 'ECU Remapping', price: 25000, priceUSD: 195, duration: '2 hours', popular: true },
      { name: 'Suspension Upgrade', price: 65000, priceUSD: 500, duration: '3-4 hours', popular: false },
      { name: 'Quick Shifter Install', price: 38000, priceUSD: 295, duration: '2 hours', popular: false },
    ],
  },
  {
    id: 'aesthetic',
    name: 'Aesthetics',
    icon: Paintbrush,
    mods: [
      { name: 'Custom Paint Job', price: 85000, priceUSD: 660, duration: '5-7 days', popular: true },
      { name: 'Vinyl Wrap', price: 45000, priceUSD: 350, duration: '2-3 days', popular: true },
      { name: 'LED Lighting Kit', price: 15000, priceUSD: 115, duration: '2 hours', popular: false },
      { name: 'Carbon Fiber Parts', price: 55000, priceUSD: 425, duration: '3-4 hours', popular: false },
      { name: 'Custom Seat', price: 28000, priceUSD: 215, duration: '3-5 days', popular: false },
    ],
  },
  {
    id: 'sound',
    name: 'Sound',
    icon: Volume2,
    mods: [
      { name: 'Akrapovic Exhaust', price: 120000, priceUSD: 930, duration: '2-3 hours', popular: true },
      { name: 'Yoshimura Slip-On', price: 75000, priceUSD: 580, duration: '1-2 hours', popular: true },
      { name: 'Arrow Full System', price: 95000, priceUSD: 735, duration: '3-4 hours', popular: false },
      { name: 'SC Project Exhaust', price: 85000, priceUSD: 660, duration: '2-3 hours', popular: false },
    ],
  },
  {
    id: 'protection',
    name: 'Protection',
    icon: Shield,
    mods: [
      { name: 'Crash Bars', price: 22000, priceUSD: 170, duration: '2 hours', popular: true },
      { name: 'Frame Sliders', price: 8500, priceUSD: 65, duration: '1 hour', popular: false },
      { name: 'Skid Plate', price: 18000, priceUSD: 140, duration: '1-2 hours', popular: false },
      { name: 'Hand Guards', price: 12000, priceUSD: 95, duration: '1 hour', popular: false },
      { name: 'Radiator Guard', price: 9500, priceUSD: 75, duration: '30 mins', popular: false },
    ],
  },
];

const recentBuilds = [
  { id: 1, name: 'Cafe Racer CB750', image: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=600&q=80', owner: 'Mike K.', mods: ['Custom Paint', 'Exhaust', 'Seat'] },
  { id: 2, name: 'ADV-Ready Himalayan', image: 'https://images.unsplash.com/photo-1609630875171-b1321377ee65?w=600&q=80', owner: 'Sarah M.', mods: ['Crash Bars', 'Luggage', 'LED'] },
  { id: 3, name: 'Street Fighter MT-07', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80', owner: 'James O.', mods: ['Exhaust', 'ECU', 'Suspension'] },
];

export default function Garage() {
  const [selectedMods, setSelectedMods] = useState<string[]>([]);
  const [customRequest, setCustomRequest] = useState({
    name: '',
    phone: '',
    bike: '',
    description: '',
  });

  const toggleMod = (modName: string) => {
    setSelectedMods(prev => 
      prev.includes(modName) 
        ? prev.filter(m => m !== modName)
        : [...prev, modName]
    );
  };

  const getTotalPrice = () => {
    let total = 0;
    modCategories.forEach(cat => {
      cat.mods.forEach(mod => {
        if (selectedMods.includes(mod.name)) {
          total += mod.price;
        }
      });
    });
    return total;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Custom build request submitted! Our team will reach out within 24 hours.');
  };

  return (
    <>
      <Helmet>
        <title>My Garage - Custom Modifications | MotoLink Africa</title>
        <meta name="description" content="Transform your motorcycle with custom modifications, performance upgrades, and personalization. Prices in KES for African riders." />
      </Helmet>

      <Navbar />

      <main className="pt-20 min-h-screen bg-background">
        {/* Hero with Image */}
        <PageHero
          title="MY"
          titleHighlight="GARAGE"
          subtitle="Transform your ride with custom modifications and performance upgrades. From subtle tweaks to full custom builds - we make your vision reality."
          image="https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=1920&q=80"
          icon={Gauge}
        >
          <Badge variant="outline" className="mt-4 text-primary-foreground border-primary-foreground/50">
            All custom work priced in KES
          </Badge>
        </PageHero>

        {/* Modifications */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Mods Catalog */}
              <div className="lg:col-span-2">
                <Tabs defaultValue="performance" className="w-full">
                  <TabsList className="grid grid-cols-4 mb-6">
                    {modCategories.map(cat => (
                      <TabsTrigger key={cat.id} value={cat.id} className="flex items-center gap-2">
                        <cat.icon className="w-4 h-4" />
                        <span className="hidden md:inline">{cat.name}</span>
                      </TabsTrigger>
                    ))}
                  </TabsList>

                  {modCategories.map(category => (
                    <TabsContent key={category.id} value={category.id}>
                      <div className="grid md:grid-cols-2 gap-4">
                        {category.mods.map((mod, index) => (
                          <motion.div
                            key={mod.name}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                          >
                            <Card 
                              className={`cursor-pointer transition-all hover-lift ${
                                selectedMods.includes(mod.name) ? 'ring-2 ring-primary bg-primary/5' : ''
                              }`}
                              onClick={() => toggleMod(mod.name)}
                            >
                              <CardContent className="p-4">
                                <div className="flex justify-between items-start mb-2">
                                  <div className="flex items-center gap-2">
                                    <h3 className="font-semibold">{mod.name}</h3>
                                    {mod.popular && (
                                      <Badge className="bg-accent text-accent-foreground text-xs">Popular</Badge>
                                    )}
                                  </div>
                                  {selectedMods.includes(mod.name) && (
                                    <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                                      <Plus className="w-4 h-4 text-primary-foreground rotate-45" />
                                    </div>
                                  )}
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="text-xl font-bold text-primary">
                                    KES {mod.price.toLocaleString()}
                                  </span>
                                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                    <Clock className="w-4 h-4" />
                                    <span>{mod.duration}</span>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          </motion.div>
                        ))}
                      </div>
                    </TabsContent>
                  ))}
                </Tabs>

                {/* Recent Builds Gallery */}
                <div className="mt-12">
                  <h2 className="font-display text-3xl mb-6">RECENT <span className="text-primary">BUILDS</span></h2>
                  <div className="grid md:grid-cols-3 gap-4">
                    {recentBuilds.map((build, index) => (
                      <motion.div
                        key={build.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="group relative overflow-hidden rounded-xl"
                      >
                        <img
                          src={build.image}
                          alt={build.name}
                          className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-secondary via-transparent to-transparent" />
                        <div className="absolute bottom-0 left-0 right-0 p-4">
                          <h3 className="font-semibold text-secondary-foreground">{build.name}</h3>
                          <p className="text-sm text-muted-foreground">by {build.owner}</p>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {build.mods.map(mod => (
                              <Badge key={mod} variant="secondary" className="text-xs">{mod}</Badge>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Quote Builder */}
              <div>
                <Card className="sticky top-24">
                  <CardHeader>
                    <CardTitle className="font-display text-2xl">BUILD QUOTE</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {selectedMods.length > 0 ? (
                      <div className="mb-6">
                        <h4 className="text-sm font-medium mb-3">Selected Modifications:</h4>
                        <div className="space-y-2">
                          {selectedMods.map(mod => (
                            <div key={mod} className="flex justify-between items-center text-sm">
                              <span>{mod}</span>
                              <button
                                onClick={() => toggleMod(mod)}
                                className="text-destructive hover:underline"
                              >
                                Remove
                              </button>
                            </div>
                          ))}
                        </div>
                        <div className="border-t border-border mt-4 pt-4">
                          <div className="flex justify-between items-center font-semibold">
                            <span>Estimated Total:</span>
                            <span className="text-2xl text-primary">
                              KES {getTotalPrice().toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-sm mb-6">
                        Click on modifications to add them to your build quote.
                      </p>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block">Your Name</label>
                        <Input
                          value={customRequest.name}
                          onChange={(e) => setCustomRequest({ ...customRequest, name: e.target.value })}
                          placeholder="John Doe"
                          required
                        />
                      </div>

                      <div>
                        <label className="text-sm font-medium mb-2 block">Phone Number</label>
                        <Input
                          value={customRequest.phone}
                          onChange={(e) => setCustomRequest({ ...customRequest, phone: e.target.value })}
                          placeholder="+254 700 123 456"
                          required
                        />
                      </div>

                      <div>
                        <label className="text-sm font-medium mb-2 block">Your Motorcycle</label>
                        <Input
                          value={customRequest.bike}
                          onChange={(e) => setCustomRequest({ ...customRequest, bike: e.target.value })}
                          placeholder="e.g., Yamaha MT-07 2023"
                          required
                        />
                      </div>

                      <div>
                        <label className="text-sm font-medium mb-2 block">Custom Requests</label>
                        <Textarea
                          value={customRequest.description}
                          onChange={(e) => setCustomRequest({ ...customRequest, description: e.target.value })}
                          placeholder="Describe your dream build..."
                          rows={3}
                        />
                      </div>

                      <Button type="submit" variant="hero" className="w-full">
                        <Cog className="w-5 h-5" />
                        Request Build Quote
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
