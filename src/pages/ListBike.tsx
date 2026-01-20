import { useState, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import PageHero from '@/components/shared/PageHero';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Bike, Upload, X, Loader2, CheckCircle, MapPin, Phone, Mail, Info } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

const BIKE_CATEGORIES = [
  'Sport Bike',
  'Cruiser',
  'Touring',
  'Adventure',
  'Scooter',
  'Electric',
  'Standard',
  'Dirt Bike',
  'Cafe Racer',
  'Other',
];

const LOCATIONS = [
  'Kitengela',
  'Mombasa Road',
  'Karen',
  'Westlands',
  'Thika Road Mall',
  'Kilimani',
  'Lavington',
  'Rongai',
  'Kiambu',
  'Other',
];

export default function ListBike() {
  const { isLoggedIn, user, profile } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    engine: '',
    power: '',
    description: '',
    price_per_day: '',
    location: '',
    contact_phone: profile?.phone || '',
    contact_email: profile?.email || user?.email || '',
    notes: '',
  });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    if (!user) {
      toast.error('Please login to upload images');
      return;
    }

    if (images.length + files.length > 5) {
      toast.error('Maximum 5 images allowed');
      return;
    }

    setUploadingImages(true);
    const newImages: string[] = [];

    try {
      for (const file of Array.from(files)) {
        // Validate file
        if (!file.type.startsWith('image/')) {
          toast.error(`${file.name} is not an image`);
          continue;
        }
        if (file.size > 5 * 1024 * 1024) {
          toast.error(`${file.name} is too large (max 5MB)`);
          continue;
        }

        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

        const { data, error } = await supabase.storage
          .from('bike-listings')
          .upload(fileName, file);

        if (error) throw error;

        const { data: { publicUrl } } = supabase.storage
          .from('bike-listings')
          .getPublicUrl(data.path);

        newImages.push(publicUrl);
      }

      setImages(prev => [...prev, ...newImages]);
      toast.success(`${newImages.length} image(s) uploaded`);
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload images');
    } finally {
      setUploadingImages(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isLoggedIn || !user) {
      toast.error('Please login to list your bike');
      navigate('/auth');
      return;
    }

    // Validation
    if (!formData.name || !formData.category || !formData.location || !formData.contact_phone) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (!formData.price_per_day || parseFloat(formData.price_per_day) <= 0) {
      toast.error('Please enter a valid price');
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase.from('bike_listings').insert({
        user_id: user.id,
        name: formData.name,
        category: formData.category,
        engine: formData.engine || null,
        power: formData.power || null,
        description: formData.description || null,
        price_per_day: parseFloat(formData.price_per_day),
        location: formData.location,
        images: images,
        contact_phone: formData.contact_phone,
        contact_email: formData.contact_email || null,
        notes: formData.notes || null,
        status: 'pending',
      });

      if (error) throw error;

      setIsSuccess(true);
      toast.success('Your bike listing has been submitted!');
    } catch (error) {
      console.error('Submit error:', error);
      toast.error('Failed to submit listing');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Success State
  if (isSuccess) {
    return (
      <>
        <Helmet>
          <title>Listing Submitted | MotoLink Africa</title>
        </Helmet>
        <Navbar />
        <main className="pt-20 min-h-screen bg-background">
          <div className="container mx-auto px-4 py-16">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-md mx-auto text-center"
            >
              <div className="w-20 h-20 bg-success/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-success" />
              </div>
              <h1 className="text-3xl font-display mb-4">LISTING SUBMITTED!</h1>
              <p className="text-muted-foreground mb-8">
                Your bike listing has been submitted for review. Our team will contact you within 24-48 hours to verify and approve your listing.
              </p>
              <div className="flex gap-4 justify-center">
                <Button onClick={() => navigate('/dashboard')}>
                  Go to Dashboard
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => {
                    setIsSuccess(false);
                    setFormData({
                      name: '',
                      category: '',
                      engine: '',
                      power: '',
                      description: '',
                      price_per_day: '',
                      location: '',
                      contact_phone: profile?.phone || '',
                      contact_email: profile?.email || user?.email || '',
                      notes: '',
                    });
                    setImages([]);
                  }}
                >
                  List Another Bike
                </Button>
              </div>
            </motion.div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>List Your Bike | MotoLink Africa</title>
        <meta name="description" content="List your motorcycle for rent on MotoLink Africa and earn extra income." />
      </Helmet>

      <Navbar />

      <main className="pt-20 min-h-screen bg-background">
        <PageHero 
          title="LIST YOUR"
          titleHighlight="BIKE"
          subtitle="Earn money by renting out your motorcycle"
          image="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1920"
          icon={Bike}
        />

        <section className="py-12">
          <div className="container mx-auto px-4 max-w-3xl">
            {!isLoggedIn ? (
              <Card>
                <CardContent className="pt-6 text-center">
                  <Bike className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                  <h2 className="text-2xl font-display mb-2">LOGIN REQUIRED</h2>
                  <p className="text-muted-foreground mb-6">Please login or create an account to list your bike</p>
                  <Button onClick={() => navigate('/auth')}>Login / Sign Up</Button>
                </CardContent>
              </Card>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card className="border-primary/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Bike className="w-5 h-5 text-primary" />
                      Bike Details
                    </CardTitle>
                    <CardDescription>
                      Fill in your motorcycle details. Our team will review and contact you.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                      {/* Images */}
                      <div>
                        <Label className="mb-2 block">Bike Images (Max 5)</Label>
                        <div className="flex flex-wrap gap-3">
                          {images.map((img, idx) => (
                            <div key={idx} className="relative">
                              <img 
                                src={img} 
                                alt={`Bike ${idx + 1}`}
                                className="w-24 h-24 object-cover rounded-lg border"
                              />
                              <button
                                type="button"
                                onClick={() => removeImage(idx)}
                                className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                          {images.length < 5 && (
                            <button
                              type="button"
                              onClick={() => fileInputRef.current?.click()}
                              disabled={uploadingImages}
                              className="w-24 h-24 border-2 border-dashed border-muted-foreground/30 rounded-lg flex flex-col items-center justify-center text-muted-foreground hover:border-primary hover:text-primary transition-colors"
                            >
                              {uploadingImages ? (
                                <Loader2 className="w-6 h-6 animate-spin" />
                              ) : (
                                <>
                                  <Upload className="w-6 h-6" />
                                  <span className="text-xs mt-1">Upload</span>
                                </>
                              )}
                            </button>
                          )}
                        </div>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                        <p className="text-xs text-muted-foreground mt-2">
                          Upload clear photos of your bike (front, side, back)
                        </p>
                      </div>

                      {/* Basic Info */}
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="name">Bike Name *</Label>
                          <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                            placeholder="e.g., Yamaha FZ-S V3"
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="category">Category *</Label>
                          <Select 
                            value={formData.category} 
                            onValueChange={(v) => setFormData(prev => ({ ...prev, category: v }))}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                              {BIKE_CATEGORIES.map(cat => (
                                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="engine">Engine (cc)</Label>
                          <Input
                            id="engine"
                            value={formData.engine}
                            onChange={(e) => setFormData(prev => ({ ...prev, engine: e.target.value }))}
                            placeholder="e.g., 149cc"
                          />
                        </div>
                        <div>
                          <Label htmlFor="power">Power (HP)</Label>
                          <Input
                            id="power"
                            value={formData.power}
                            onChange={(e) => setFormData(prev => ({ ...prev, power: e.target.value }))}
                            placeholder="e.g., 12.4 HP"
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                          id="description"
                          value={formData.description}
                          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                          placeholder="Describe your bike's condition, features, and any special details..."
                          rows={3}
                        />
                      </div>

                      {/* Rental Info */}
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="price" className="flex items-center gap-1">
                            Price per Day (KES) *
                          </Label>
                          <Input
                            id="price"
                            type="number"
                            min="0"
                            value={formData.price_per_day}
                            onChange={(e) => setFormData(prev => ({ ...prev, price_per_day: e.target.value }))}
                            placeholder="e.g., 2500"
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="location" className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            Pickup Location *
                          </Label>
                          <Select 
                            value={formData.location} 
                            onValueChange={(v) => setFormData(prev => ({ ...prev, location: v }))}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select location" />
                            </SelectTrigger>
                            <SelectContent>
                              {LOCATIONS.map(loc => (
                                <SelectItem key={loc} value={loc}>{loc}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {/* Contact Info */}
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="phone" className="flex items-center gap-1">
                            <Phone className="w-4 h-4" />
                            Contact Phone *
                          </Label>
                          <Input
                            id="phone"
                            type="tel"
                            value={formData.contact_phone}
                            onChange={(e) => setFormData(prev => ({ ...prev, contact_phone: e.target.value }))}
                            placeholder="07XX XXX XXX"
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="email" className="flex items-center gap-1">
                            <Mail className="w-4 h-4" />
                            Contact Email
                          </Label>
                          <Input
                            id="email"
                            type="email"
                            value={formData.contact_email}
                            onChange={(e) => setFormData(prev => ({ ...prev, contact_email: e.target.value }))}
                            placeholder="your@email.com"
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="notes">Additional Notes</Label>
                        <Textarea
                          id="notes"
                          value={formData.notes}
                          onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                          placeholder="Any terms, availability, or special conditions..."
                          rows={2}
                        />
                      </div>

                      {/* Info Box */}
                      <div className="bg-muted/50 rounded-lg p-4 flex gap-3">
                        <Info className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                        <div className="text-sm text-muted-foreground">
                          <p className="font-medium text-foreground mb-1">What happens next?</p>
                          <ul className="list-disc list-inside space-y-1">
                            <li>Our team will review your listing within 24-48 hours</li>
                            <li>We'll contact you to verify bike details and ownership</li>
                            <li>Once approved, your bike will be visible to renters</li>
                            <li>You'll receive booking requests via WhatsApp/call</li>
                          </ul>
                        </div>
                      </div>

                      <Button 
                        type="submit" 
                        size="lg" 
                        className="w-full"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Submitting...
                          </>
                        ) : (
                          <>
                            <Bike className="w-4 h-4 mr-2" />
                            Submit Listing
                          </>
                        )}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
