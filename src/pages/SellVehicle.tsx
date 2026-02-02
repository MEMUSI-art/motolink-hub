import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Upload, X, Loader2, ImagePlus } from 'lucide-react';
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
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const vehicleTypes = [
  { value: 'motorcycle', label: 'Motorcycle' },
  { value: 'scooter', label: 'Scooter' },
  { value: 'buggy', label: 'Buggy' },
  { value: 'atv', label: 'ATV' },
];

const conditions = [
  { value: 'new', label: 'New (Brand new, never used)' },
  { value: 'like_new', label: 'Like New (Barely used, no visible wear)' },
  { value: 'excellent', label: 'Excellent (Minimal signs of use)' },
  { value: 'good', label: 'Good (Normal wear and tear)' },
  { value: 'fair', label: 'Fair (Visible wear, fully functional)' },
];

const locations = [
  'Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret',
  'Thika', 'Kitengela', 'Karen', 'Westlands', 'Other'
];

export default function SellVehicle() {
  const navigate = useNavigate();
  const { user, isLoggedIn } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  const [formData, setFormData] = useState({
    vehicle_type: '',
    title: '',
    brand: '',
    model: '',
    year: '',
    mileage: '',
    condition: '',
    price: '',
    negotiable: true,
    description: '',
    engine: '',
    power: '',
    color: '',
    location: '',
    contact_phone: '',
    contact_email: '',
    features: '',
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (images.length + files.length > 8) {
      toast.error('Maximum 8 images allowed');
      return;
    }

    const newImages = [...images, ...files];
    setImages(newImages);

    // Create previews
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
      toast.error('Please login to list your vehicle');
      navigate('/auth');
      return;
    }

    if (!formData.vehicle_type || !formData.title || !formData.brand || !formData.model || 
        !formData.condition || !formData.price || !formData.location || !formData.contact_phone) {
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
        
        const { error: uploadError, data } = await supabase.storage
          .from('vehicle-sales')
          .upload(fileName, image);

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from('vehicle-sales')
          .getPublicUrl(fileName);

        imageUrls.push(urlData.publicUrl);
      }

      // Create listing
      const { error } = await supabase.from('vehicle_sales').insert({
        user_id: user.id,
        vehicle_type: formData.vehicle_type,
        title: formData.title,
        brand: formData.brand,
        model: formData.model,
        year: formData.year ? parseInt(formData.year) : null,
        mileage: formData.mileage ? parseInt(formData.mileage) : null,
        condition: formData.condition,
        price: parseFloat(formData.price),
        negotiable: formData.negotiable,
        description: formData.description || null,
        engine: formData.engine || null,
        power: formData.power || null,
        color: formData.color || null,
        location: formData.location,
        images: imageUrls,
        contact_phone: formData.contact_phone,
        contact_email: formData.contact_email || null,
        features: formData.features ? formData.features.split(',').map(f => f.trim()) : [],
        status: 'pending',
      });

      if (error) throw error;

      toast.success('Vehicle listed successfully! It will be visible after admin approval.');
      navigate('/marketplace');
    } catch (error) {
      console.error('Error creating listing:', error);
      toast.error('Failed to create listing. Please try again.');
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
              <p className="text-muted-foreground mb-6">Please login to list your vehicle for sale.</p>
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
        <title>Sell Your Vehicle | MotoLink Africa</title>
        <meta name="description" content="List your motorcycle, scooter, buggy or ATV for sale on MotoLink Africa marketplace." />
      </Helmet>

      <Navbar />

      <PageHero
        title="SELL YOUR"
        titleHighlight="VEHICLE"
        subtitle="List your bike or buggy and reach thousands of buyers"
        image="/placeholder.svg"
      />

      <main className="py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Info */}
            <Card>
              <CardHeader>
                <CardTitle>Vehicle Information</CardTitle>
              </CardHeader>
              <CardContent className="grid md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <Label htmlFor="title">Listing Title *</Label>
                  <Input
                    id="title"
                    placeholder="e.g., 2022 Honda CB500F - Low Mileage"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label>Vehicle Type *</Label>
                  <Select value={formData.vehicle_type} onValueChange={(v) => setFormData({ ...formData, vehicle_type: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {vehicleTypes.map(type => (
                        <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Condition *</Label>
                  <Select value={formData.condition} onValueChange={(v) => setFormData({ ...formData, condition: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select condition" />
                    </SelectTrigger>
                    <SelectContent>
                      {conditions.map(c => (
                        <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="brand">Brand *</Label>
                  <Input
                    id="brand"
                    placeholder="e.g., Honda"
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="model">Model *</Label>
                  <Input
                    id="model"
                    placeholder="e.g., CB500F"
                    value={formData.model}
                    onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="year">Year</Label>
                  <Input
                    id="year"
                    type="number"
                    placeholder="e.g., 2022"
                    min="1980"
                    max={new Date().getFullYear() + 1}
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="mileage">Mileage (km)</Label>
                  <Input
                    id="mileage"
                    type="number"
                    placeholder="e.g., 15000"
                    value={formData.mileage}
                    onChange={(e) => setFormData({ ...formData, mileage: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="engine">Engine</Label>
                  <Input
                    id="engine"
                    placeholder="e.g., 471cc Parallel Twin"
                    value={formData.engine}
                    onChange={(e) => setFormData({ ...formData, engine: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="power">Power</Label>
                  <Input
                    id="power"
                    placeholder="e.g., 47 HP"
                    value={formData.power}
                    onChange={(e) => setFormData({ ...formData, power: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="color">Color</Label>
                  <Input
                    id="color"
                    placeholder="e.g., Matte Black"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  />
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="features">Features (comma-separated)</Label>
                  <Input
                    id="features"
                    placeholder="e.g., ABS, LED Lights, Digital Display, Slipper Clutch"
                    value={formData.features}
                    onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                  />
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Tell buyers more about your vehicle..."
                    rows={4}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Pricing */}
            <Card>
              <CardHeader>
                <CardTitle>Pricing & Location</CardTitle>
              </CardHeader>
              <CardContent className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="price">Price (KES) *</Label>
                  <Input
                    id="price"
                    type="number"
                    placeholder="e.g., 850000"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label>Location *</Label>
                  <Select value={formData.location} onValueChange={(v) => setFormData({ ...formData, location: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select location" />
                    </SelectTrigger>
                    <SelectContent>
                      {locations.map(loc => (
                        <SelectItem key={loc} value={loc}>{loc}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-2">
                  <Checkbox
                    id="negotiable"
                    checked={formData.negotiable}
                    onCheckedChange={(checked) => setFormData({ ...formData, negotiable: checked as boolean })}
                  />
                  <Label htmlFor="negotiable" className="cursor-pointer">Price is negotiable</Label>
                </div>
              </CardContent>
            </Card>

            {/* Images */}
            <Card>
              <CardHeader>
                <CardTitle>Photos (Max 8)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative aspect-video rounded-lg overflow-hidden bg-muted">
                      <img src={preview} alt={`Preview ${index + 1}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-2 right-2 p-1 bg-destructive text-destructive-foreground rounded-full"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  
                  {images.length < 8 && (
                    <label className="aspect-video rounded-lg border-2 border-dashed border-border flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors">
                      <ImagePlus className="w-8 h-8 text-muted-foreground mb-2" />
                      <span className="text-sm text-muted-foreground">Add Photo</span>
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
              </CardContent>
            </Card>

            {/* Contact */}
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="contact_phone">Phone Number *</Label>
                  <Input
                    id="contact_phone"
                    type="tel"
                    placeholder="e.g., 0712345678"
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
                  <Upload className="w-5 h-5" />
                  Submit Listing
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