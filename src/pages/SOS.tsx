import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import PageHero from '@/components/shared/PageHero';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertTriangle, Phone, MapPin, Truck, Wrench, Shield, Clock, CheckCircle, HeartPulse, Car } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

const emergencyServices = [
  { icon: Truck, name: 'Towing Service', description: '24/7 flatbed towing to nearest garage', response: '30-45 mins', price: 5000 },
  { icon: Wrench, name: 'Roadside Repair', description: 'On-site repairs for common breakdowns', response: '20-30 mins', price: 3500 },
  { icon: Car, name: 'Fuel Delivery', description: 'Emergency fuel brought to your location', response: '15-25 mins', price: 2000 },
  { icon: HeartPulse, name: 'Accident Response', description: 'Coordination with emergency services', response: 'Immediate', price: 0 },
];

const coverageAreas = [
  'Nairobi Metropolitan',
  'Mombasa',
  'Kisumu',
  'Nakuru',
  'Eldoret',
  'Thika',
  'Machakos',
  'Nyeri',
];

const MOTOLINK_PHONE_DISPLAY = "0707931926";
const MOTOLINK_PHONE_E164 = "+254707931926";
const MOTOLINK_WHATSAPP_NUMBER = "254707931926";

export default function SOS() {
  const [emergencyType, setEmergencyType] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    location: '',
    description: '',
  });

  const handleEmergencyCall = () => {
    window.location.href = `tel:${MOTOLINK_PHONE_E164}`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!emergencyType) {
      toast.error('Please select an emergency type.');
      return;
    }

    const message = encodeURIComponent(
      `SOS REQUEST 🆘\n\nType: ${emergencyType}\nName: ${formData.name}\nPhone: ${formData.phone}\nLocation: ${formData.location}\n\nDetails:\n${formData.description}\n\nSent via MotoLink SOS page.`
    );

    window.open(`https://wa.me/${MOTOLINK_WHATSAPP_NUMBER}?text=${message}`, '_blank');
    toast.success('SOS request ready on WhatsApp — send it to dispatch.');

    setEmergencyType('');
    setFormData({ name: '', phone: '', location: '', description: '' });
  };

  return (
    <>
      <Helmet>
        <title>SOS Emergency Services | MotoLink Africa</title>
        <meta name="description" content="24/7 emergency roadside assistance for motorcyclists. Towing, repairs, fuel delivery, and accident response across Africa." />
      </Helmet>

      <Navbar />

      <main className="pt-20 min-h-screen bg-background">
        {/* Hero with Image */}
        <PageHero
          title="SOS"
          titleHighlight="EMERGENCY"
          subtitle="Stranded? Broken down? Had an accident? We're here 24/7 to get you back on the road safely."
          image="https://images.unsplash.com/photo-1558981359-219d6364c9c8?w=1920&q=80"
          icon={AlertTriangle}
          variant="destructive"
        >
          {/* Emergency Call Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-8"
          >
            <Button 
              variant="sos" 
              size="xl" 
              onClick={handleEmergencyCall}
              className="text-xl px-12"
            >
              <Phone className="w-6 h-6" />
              CALL EMERGENCY: {MOTOLINK_PHONE_DISPLAY}
            </Button>
          </motion.div>
        </PageHero>

        {/* Quick Stats */}
        <section className="py-8 bg-secondary">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              {[
                { value: '24/7', label: 'Always Available' },
                { value: '< 30min', label: 'Avg. Response Time' },
                { value: '50+', label: 'Response Vehicles' },
                { value: '8', label: 'Coverage Areas' },
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <p className="font-display text-3xl md:text-4xl text-primary">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Services & Form */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Emergency Services */}
              <div className="lg:col-span-2">
                <h2 className="font-display text-3xl mb-6">EMERGENCY <span className="text-primary">SERVICES</span></h2>
                <div className="grid md:grid-cols-2 gap-4">
                  {emergencyServices.map((service, index) => (
                    <motion.div
                      key={service.name}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card className="h-full hover-lift">
                        <CardContent className="p-6">
                          <div className="w-12 h-12 rounded-xl bg-destructive/10 flex items-center justify-center mb-4">
                            <service.icon className="w-6 h-6 text-destructive" />
                          </div>
                          <h3 className="font-semibold text-lg mb-2">{service.name}</h3>
                          <p className="text-sm text-muted-foreground mb-4">{service.description}</p>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1 text-sm">
                              <Clock className="w-4 h-4 text-primary" />
                              <span>{service.response}</span>
                            </div>
                            {service.price > 0 ? (
                              <span className="font-bold text-primary">From KES {service.price.toLocaleString()}</span>
                            ) : (
                              <span className="text-success font-medium">Free</span>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>

                {/* Coverage Areas */}
                <div className="mt-12">
                  <h2 className="font-display text-3xl mb-6">COVERAGE <span className="text-primary">AREAS</span></h2>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {coverageAreas.map((area, index) => (
                      <motion.div
                        key={area}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex items-center gap-2 bg-card p-3 rounded-lg border border-border"
                      >
                        <MapPin className="w-4 h-4 text-primary" />
                        <span className="text-sm">{area}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* How It Works */}
                <div className="mt-12">
                  <h2 className="font-display text-3xl mb-6">HOW IT <span className="text-primary">WORKS</span></h2>
                  <div className="grid md:grid-cols-3 gap-6">
                    {[
                      { step: 1, title: 'Request Help', desc: 'Call or use the form to describe your emergency' },
                      { step: 2, title: 'Get Located', desc: 'Share your GPS location or describe where you are' },
                      { step: 3, title: 'Help Arrives', desc: 'Our nearest responder will reach you quickly' },
                    ].map((item, index) => (
                      <motion.div
                        key={item.step}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="text-center"
                      >
                        <div className="w-12 h-12 rounded-full gradient-hero text-primary-foreground font-display text-2xl flex items-center justify-center mx-auto mb-4">
                          {item.step}
                        </div>
                        <h3 className="font-semibold mb-2">{item.title}</h3>
                        <p className="text-sm text-muted-foreground">{item.desc}</p>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>

              {/* SOS Request Form */}
              <div>
                <Card className="sticky top-24 border-2 border-destructive/30">
                  <CardHeader className="bg-destructive/10">
                    <CardTitle className="font-display text-2xl flex items-center gap-2">
                      <AlertTriangle className="w-6 h-6 text-destructive" />
                      REQUEST HELP
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6 max-h-[calc(100vh-10rem)] overflow-y-auto">
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block">Emergency Type</label>
                        <Select value={emergencyType} onValueChange={setEmergencyType}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select emergency type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="breakdown">Breakdown</SelectItem>
                            <SelectItem value="accident">Accident</SelectItem>
                            <SelectItem value="flat-tire">Flat Tire</SelectItem>
                            <SelectItem value="no-fuel">Out of Fuel</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <label className="text-sm font-medium mb-2 block">Your Name</label>
                        <Input
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder="John Doe"
                          required
                        />
                      </div>

                      <div>
                        <label className="text-sm font-medium mb-2 block">Phone Number</label>
                        <Input
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          placeholder="+254 700 123 456"
                          required
                        />
                      </div>

                      <div>
                        <label className="text-sm font-medium mb-2 block">Your Location</label>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                          <Textarea
                            value={formData.location}
                            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                            placeholder="Describe your location or share GPS coordinates..."
                            className="pl-10"
                            rows={2}
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-sm font-medium mb-2 block">What Happened?</label>
                        <Textarea
                          value={formData.description}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                          placeholder="Briefly describe the situation..."
                          rows={3}
                          required
                        />
                      </div>

                      <Button type="submit" variant="sos" className="w-full" size="lg">
                        <AlertTriangle className="w-5 h-5" />
                        SEND SOS REQUEST
                      </Button>

                      <p className="text-xs text-muted-foreground text-center">
                        For life-threatening emergencies, please call 999 immediately.
                      </p>
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
