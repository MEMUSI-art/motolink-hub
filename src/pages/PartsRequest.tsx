import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Upload, X, Loader2, ImagePlus, Wrench, Search } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import PageHero from '@/components/shared/PageHero';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

const urgencyLevels = [
  { value: 'low', label: 'Low', description: 'No rush, when available' },
  { value: 'normal', label: 'Normal', description: 'Within 1-2 weeks' },
  { value: 'high', label: 'High', description: 'Within a few days' },
  { value: 'urgent', label: 'Urgent', description: 'As soon as possible' },
];

export default function PartsRequest() {
  const navigate = useNavigate();
  const { user, isLoggedIn } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  const [formData, setFormData] = useState({
    part_name: '',
    part_number: '',
    bike_make: '',
    bike_model: '',
    bike_year: '',
    quantity: '1',
    urgency: 'normal',
    description: '',
    contact_phone: '',
    contact_email: '',
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (images.length + files.length > 4) {
      toast.error('Maximum 4 images allowed');
      return;
    }

    const newImages = [...images, ...files];
    setImages(newImages);

    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isLoggedIn || !user) {
      toast.error('Please login to submit a parts request');
      navigate('/auth');
      return;
    }

    if (!formData.part_name || !formData.bike_make || !formData.bike_model || !formData.contact_phone) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);

    try {
      // Upload images
      const imageUrls: string[] = [];
      for (const image of images) {
        const fileExt = image.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('parts-requests')
          .upload(fileName, image);

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from('parts-requests')
          .getPublicUrl(fileName);

        imageUrls.push(urlData.publicUrl);
      }

      // Create request
      const { error } = await supabase.from('parts_requests').insert({
        user_id: user.id,
        part_name: formData.part_name,
        part_number: formData.part_number || null,
        bike_make: formData.bike_make,
        bike_model: formData.bike_model,
        bike_year: formData.bike_year ? parseInt(formData.bike_year) : null,
        quantity: parseInt(formData.quantity) || 1,
        urgency: formData.urgency,
        description: formData.description || null,
        images: imageUrls,
        contact_phone: formData.contact_phone,
        contact_email: formData.contact_email || null,
        status: 'pending',
      });

      if (error) throw error;

      toast.success('Parts request submitted! We\'ll source and quote for you shortly.');
      navigate('/dashboard');
    } catch (error) {
      console.error('Error submitting parts request:', error);
      toast.error('Failed to submit request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isLoggedIn) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          <Card className="max-w-md w-full mx-4">
            <CardContent className="p-8 text-center">
              <h2 className="font-display text-2xl mb-4">Login Required</h2>
              <p className="text-muted-foreground mb-6">Please login to request parts sourcing.</p>
              <Button variant="hero" onClick={() => navigate('/auth')}>Login / Sign Up</Button>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>Request Parts | MotoLink Africa</title>
        <meta name="description" content="Can't find the part you need? Let MotoLink source it for you. We'll find and quote motorcycle parts from trusted suppliers." />
      </Helmet>

      <Navbar />

      <PageHero
        title="SOURCE"
        titleHighlight="PARTS"
        subtitle="Can't find it? We'll source it for you"
        image="/placeholder.svg"
      />

      <main className="py-12">
        <div className="container mx-auto px-4 max-w-2xl">
          <Card className="mb-8 bg-primary/5 border-primary/20">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Search className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-display text-lg text-foreground mb-1">How It Works</h3>
                  <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                    <li>Submit your parts request with details</li>
                    <li>Our team sources from trusted suppliers</li>
                    <li>We contact you with availability & quote</li>
                    <li>Confirm & we handle delivery</li>
                  </ol>
                </div>
              </div>
            </CardContent>
          </Card>

          <form onSubmit={handleSubmit} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wrench className="w-5 h-5" />
                  Part Details
                </CardTitle>
                <CardDescription>Tell us what you're looking for</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="part_name">Part Name *</Label>
                  <Input
                    id="part_name"
                    placeholder="e.g., Front Brake Pads, Chain Sprocket Kit"
                    value={formData.part_name}
                    onChange={(e) => setFormData({ ...formData, part_name: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="part_number">Part Number (if known)</Label>
                  <Input
                    id="part_number"
                    placeholder="e.g., 06455-KYJ-405"
                    value={formData.part_number}
                    onChange={(e) => setFormData({ ...formData, part_number: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="bike_make">Bike Make *</Label>
                    <Input
                      id="bike_make"
                      placeholder="e.g., Honda"
                      value={formData.bike_make}
                      onChange={(e) => setFormData({ ...formData, bike_make: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="bike_model">Bike Model *</Label>
                    <Input
                      id="bike_model"
                      placeholder="e.g., CB500F"
                      value={formData.bike_model}
                      onChange={(e) => setFormData({ ...formData, bike_model: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="bike_year">Bike Year</Label>
                    <Input
                      id="bike_year"
                      type="number"
                      placeholder="e.g., 2020"
                      value={formData.bike_year}
                      onChange={(e) => setFormData({ ...formData, bike_year: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="quantity">Quantity</Label>
                    <Input
                      id="quantity"
                      type="number"
                      min="1"
                      value={formData.quantity}
                      onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Additional Details</Label>
                  <Textarea
                    id="description"
                    placeholder="Any specific requirements, OEM vs aftermarket preference, etc."
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>

                {/* Images */}
                <div>
                  <Label>Reference Images (Optional)</Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
                    {imagePreviews.map((preview, index) => (
                      <div key={index} className="relative aspect-square rounded-lg overflow-hidden bg-muted">
                        <img src={preview} alt={`Preview ${index + 1}`} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-2 right-2 p-1 bg-destructive text-destructive-foreground rounded-full"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                    
                    {images.length < 4 && (
                      <label className="aspect-square rounded-lg border-2 border-dashed border-border flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors">
                        <ImagePlus className="w-6 h-6 text-muted-foreground mb-1" />
                        <span className="text-xs text-muted-foreground">Add Photo</span>
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handleImageChange}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Urgency Level</CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup
                  value={formData.urgency}
                  onValueChange={(v) => setFormData({ ...formData, urgency: v })}
                  className="grid grid-cols-2 gap-4"
                >
                  {urgencyLevels.map(level => (
                    <div key={level.value} className="flex items-center space-x-2">
                      <RadioGroupItem value={level.value} id={level.value} />
                      <Label htmlFor={level.value} className="cursor-pointer">
                        <span className="font-medium">{level.label}</span>
                        <span className="block text-xs text-muted-foreground">{level.description}</span>
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="contact_phone">Phone Number *</Label>
                  <Input
                    id="contact_phone"
                    type="tel"
                    placeholder="0712345678"
                    value={formData.contact_phone}
                    onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="contact_email">Email (Optional)</Label>
                  <Input
                    id="contact_email"
                    type="email"
                    placeholder="your@email.com"
                    value={formData.contact_email}
                    onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                  />
                </div>
              </CardContent>
            </Card>

            <Button type="submit" variant="hero" size="lg" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Search className="w-5 h-5" />
                  Submit Parts Request
                </>
              )}
            </Button>
          </form>
        </div>
      </main>

      <Footer />
    </>
  );
}