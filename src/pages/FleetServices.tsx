import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Building2, Wrench, Search, Truck, Shield, CheckCircle, Phone } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import PageHero from '@/components/shared/PageHero';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import heroToursImage from '@/assets/tours/hero-tours.jpg';

const serviceTypes = [
  {
    value: 'maintenance',
    label: 'Fleet Maintenance',
    icon: Wrench,
    description: 'Regular servicing, repairs, and upkeep for your motorcycle fleet.',
  },
  {
    value: 'pre-purchase',
    label: 'Pre-Purchase Inspection',
    icon: Search,
    description: 'Thorough inspection before buying motorcycles — engine, frame, electronics & more.',
  },
  {
    value: 'inspection',
    label: 'Fleet Inspection',
    icon: Shield,
    description: 'Comprehensive safety and compliance checks across your entire fleet.',
  },
  {
    value: 'fleet-setup',
    label: 'Fleet Setup & Consulting',
    icon: Truck,
    description: 'Help selecting, purchasing, and setting up a new motorcycle fleet for your business.',
  },
];

export default function FleetServices() {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    organization_name: '',
    contact_person: '',
    contact_email: '',
    contact_phone: '',
    fleet_size: '1',
    service_type: '',
    vehicle_details: '',
    description: '',
    preferred_date: '',
    urgency: 'normal',
    location: '',
  });

  const handleChange = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.organization_name || !form.contact_person || !form.contact_phone || !form.service_type || !form.location) {
      toast.error('Please fill in all required fields');
      return;
    }
    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('fleet_service_requests').insert({
        user_id: user?.id || null,
        organization_name: form.organization_name,
        contact_person: form.contact_person,
        contact_email: form.contact_email || null,
        contact_phone: form.contact_phone,
        fleet_size: parseInt(form.fleet_size) || 1,
        service_type: form.service_type,
        vehicle_details: form.vehicle_details || null,
        description: form.description || null,
        preferred_date: form.preferred_date || null,
        urgency: form.urgency,
        location: form.location,
      });
      if (error) throw error;
      setSubmitted(true);
      toast.success('Your fleet service request has been submitted!');
    } catch (err: any) {
      toast.error(err.message || 'Failed to submit request');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Fleet Services & Pre-Purchase Inspection | MotoLink Africa</title>
        <meta name="description" content="Fleet maintenance, pre-purchase motorcycle inspection, and fleet consulting services for organizations in Kenya." />
      </Helmet>

      <Navbar />

      <PageHero
        title="FLEET"
        titleHighlight="SERVICES"
        subtitle="Maintenance, inspections & fleet consulting for organizations"
        image={heroToursImage}
      />

      <main className="py-12">
        <div className="container mx-auto px-4">
          {/* Service types grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
            {serviceTypes.map((svc) => (
              <Card key={svc.value} className="text-center hover-lift cursor-pointer border-2 transition-colors"
                onClick={() => handleChange('service_type', svc.value)}
                style={{ borderColor: form.service_type === svc.value ? 'hsl(var(--primary))' : undefined }}
              >
                <CardContent className="p-6">
                  <svc.icon className="w-10 h-10 mx-auto mb-3 text-primary" />
                  <h3 className="font-display text-lg mb-1">{svc.label}</h3>
                  <p className="text-xs text-muted-foreground">{svc.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {submitted ? (
            <Card className="max-w-lg mx-auto text-center">
              <CardContent className="p-10">
                <CheckCircle className="w-16 h-16 mx-auto mb-4 text-success" />
                <h2 className="font-display text-3xl mb-2">Request Submitted!</h2>
                <p className="text-muted-foreground mb-6">
                  Our team will review your request and get back to you within 24 hours.
                </p>
                <div className="flex gap-3 justify-center">
                  <Button variant="hero" onClick={() => { setSubmitted(false); setForm({ organization_name: '', contact_person: '', contact_email: '', contact_phone: '', fleet_size: '1', service_type: '', vehicle_details: '', description: '', preferred_date: '', urgency: 'normal', location: '' }); }}>
                    Submit Another
                  </Button>
                  <Button variant="outline" asChild>
                    <a href="https://wa.me/254707931926" target="_blank" rel="noopener noreferrer">
                      <Phone className="w-4 h-4" /> Contact Us
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="max-w-2xl mx-auto">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-primary" />
                  Fleet Service Request
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Service type (hidden if selected above) */}
                  {!form.service_type && (
                    <div>
                      <Label>Service Type *</Label>
                      <Select value={form.service_type} onValueChange={(v) => handleChange('service_type', v)}>
                        <SelectTrigger><SelectValue placeholder="Select service type" /></SelectTrigger>
                        <SelectContent>
                          {serviceTypes.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  {form.service_type && (
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-sm">{serviceTypes.find(s => s.value === form.service_type)?.label}</Badge>
                      <button type="button" className="text-xs text-primary underline" onClick={() => handleChange('service_type', '')}>Change</button>
                    </div>
                  )}

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="org">Organization Name *</Label>
                      <Input id="org" placeholder="e.g. SafeBoda Kenya" value={form.organization_name} onChange={e => handleChange('organization_name', e.target.value)} required />
                    </div>
                    <div>
                      <Label htmlFor="person">Contact Person *</Label>
                      <Input id="person" placeholder="Full name" value={form.contact_person} onChange={e => handleChange('contact_person', e.target.value)} required />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="phone">Phone *</Label>
                      <Input id="phone" placeholder="0712 345 678" value={form.contact_phone} onChange={e => handleChange('contact_phone', e.target.value)} required />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" placeholder="fleet@company.co.ke" value={form.contact_email} onChange={e => handleChange('contact_email', e.target.value)} />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="fleet-size">Fleet Size</Label>
                      <Input id="fleet-size" type="number" min="1" value={form.fleet_size} onChange={e => handleChange('fleet_size', e.target.value)} />
                    </div>
                    <div>
                      <Label htmlFor="urgency">Urgency</Label>
                      <Select value={form.urgency} onValueChange={(v) => handleChange('urgency', v)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="normal">Normal</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="urgent">Urgent</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="pref-date">Preferred Date</Label>
                      <Input id="pref-date" type="date" value={form.preferred_date} onChange={e => handleChange('preferred_date', e.target.value)} />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="location">Location *</Label>
                    <Input id="location" placeholder="e.g. Nairobi, Westlands" value={form.location} onChange={e => handleChange('location', e.target.value)} required />
                  </div>

                  <div>
                    <Label htmlFor="vehicles">Vehicle Details</Label>
                    <Input id="vehicles" placeholder="e.g. 20x Honda CB125, 5x TVS Apache RTR" value={form.vehicle_details} onChange={e => handleChange('vehicle_details', e.target.value)} />
                  </div>

                  <div>
                    <Label htmlFor="desc">Additional Details</Label>
                    <Textarea id="desc" placeholder="Describe what you need — maintenance schedule, specific inspections, purchase advice, etc." value={form.description} onChange={e => handleChange('description', e.target.value)} rows={4} />
                  </div>

                  <Button type="submit" variant="hero" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? 'Submitting...' : 'Submit Fleet Service Request'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
}
