import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Navigation, Send, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

interface RouteRequestFormProps {
  onSuccess?: () => void;
}

export default function RouteRequestForm({ onSuccess }: RouteRequestFormProps) {
  const navigate = useNavigate();
  const { user, isLoggedIn } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    start_location: '',
    end_location: '',
    estimated_distance_km: '',
    difficulty: 'moderate',
    contact_email: '',
    contact_phone: '',
  });
  
  const [terrainTypes, setTerrainTypes] = useState<string[]>([]);
  const [pointsOfInterest, setPointsOfInterest] = useState<string[]>([]);
  const [newTerrain, setNewTerrain] = useState('');
  const [newPOI, setNewPOI] = useState('');

  const terrainOptions = ['Tarmac', 'Gravel', 'Mud', 'Sand', 'Rocky', 'Water crossings', 'Forest trails'];

  const handleAddTerrain = (terrain: string) => {
    if (terrain && !terrainTypes.includes(terrain)) {
      setTerrainTypes([...terrainTypes, terrain]);
    }
    setNewTerrain('');
  };

  const handleRemoveTerrain = (terrain: string) => {
    setTerrainTypes(terrainTypes.filter(t => t !== terrain));
  };

  const handleAddPOI = () => {
    if (newPOI.trim() && !pointsOfInterest.includes(newPOI.trim())) {
      setPointsOfInterest([...pointsOfInterest, newPOI.trim()]);
    }
    setNewPOI('');
  };

  const handleRemovePOI = (poi: string) => {
    setPointsOfInterest(pointsOfInterest.filter(p => p !== poi));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.start_location || !formData.end_location) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase.from('route_requests').insert({
        user_id: user?.id || null,
        title: formData.title,
        description: formData.description || null,
        start_location: formData.start_location,
        end_location: formData.end_location,
        estimated_distance_km: formData.estimated_distance_km ? parseFloat(formData.estimated_distance_km) : null,
        difficulty: formData.difficulty,
        terrain_types: terrainTypes,
        points_of_interest: pointsOfInterest,
        contact_email: formData.contact_email || null,
        contact_phone: formData.contact_phone || null,
        status: 'pending',
      });

      if (error) throw error;

      toast.success('Route suggestion submitted! We\'ll review it and get back to you.');
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        start_location: '',
        end_location: '',
        estimated_distance_km: '',
        difficulty: 'moderate',
        contact_email: '',
        contact_phone: '',
      });
      setTerrainTypes([]);
      setPointsOfInterest([]);
      
      onSuccess?.();
    } catch (error) {
      console.error('Error submitting route request:', error);
      toast.error('Failed to submit route suggestion. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="border-2 border-dashed border-primary/30 bg-gradient-to-br from-primary/5 to-accent/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Navigation className="w-5 h-5 text-primary" />
          Suggest a Route
        </CardTitle>
        <CardDescription>
          Know an amazing route? Share it with the MotoLink community!
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Label htmlFor="title">Route Name *</Label>
              <Input
                id="title"
                placeholder="e.g., Sunrise Ridge Trail"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="start_location">Start Location *</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-success" />
                <Input
                  id="start_location"
                  placeholder="Where does the route begin?"
                  value={formData.start_location}
                  onChange={(e) => setFormData({ ...formData, start_location: e.target.value })}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="end_location">End Location *</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-destructive" />
                <Input
                  id="end_location"
                  placeholder="Where does the route end?"
                  value={formData.end_location}
                  onChange={(e) => setFormData({ ...formData, end_location: e.target.value })}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="distance">Estimated Distance (km)</Label>
              <Input
                id="distance"
                type="number"
                placeholder="e.g., 85"
                value={formData.estimated_distance_km}
                onChange={(e) => setFormData({ ...formData, estimated_distance_km: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="difficulty">Difficulty Level</Label>
              <Select value={formData.difficulty} onValueChange={(v) => setFormData({ ...formData, difficulty: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">Easy - Beginner friendly</SelectItem>
                  <SelectItem value="moderate">Moderate - Some experience needed</SelectItem>
                  <SelectItem value="challenging">Challenging - Advanced riders</SelectItem>
                  <SelectItem value="expert">Expert - Professional level</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="description">Route Description</Label>
            <Textarea
              id="description"
              placeholder="Describe the route, what makes it special, best time to ride, etc."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>

          {/* Terrain Types */}
          <div>
            <Label>Terrain Types</Label>
            <div className="flex flex-wrap gap-2 mt-2 mb-2">
              {terrainTypes.map((terrain) => (
                <Badge key={terrain} variant="secondary" className="cursor-pointer" onClick={() => handleRemoveTerrain(terrain)}>
                  {terrain} ×
                </Badge>
              ))}
            </div>
            <div className="flex gap-2 flex-wrap">
              {terrainOptions.filter(t => !terrainTypes.includes(t)).map((option) => (
                <Badge 
                  key={option} 
                  variant="outline" 
                  className="cursor-pointer hover:bg-primary/10"
                  onClick={() => handleAddTerrain(option)}
                >
                  + {option}
                </Badge>
              ))}
            </div>
          </div>

          {/* Points of Interest */}
          <div>
            <Label>Points of Interest</Label>
            <div className="flex flex-wrap gap-2 mt-2 mb-2">
              {pointsOfInterest.map((poi) => (
                <Badge key={poi} variant="secondary" className="cursor-pointer" onClick={() => handleRemovePOI(poi)}>
                  {poi} ×
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Add a viewpoint, restaurant, landmark..."
                value={newPOI}
                onChange={(e) => setNewPOI(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddPOI())}
              />
              <Button type="button" variant="outline" onClick={handleAddPOI}>Add</Button>
            </div>
          </div>

          {/* Contact Info */}
          <div className="grid md:grid-cols-2 gap-4 pt-4 border-t border-border">
            <div>
              <Label htmlFor="contact_email">Your Email (optional)</Label>
              <Input
                id="contact_email"
                type="email"
                placeholder="email@example.com"
                value={formData.contact_email}
                onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="contact_phone">Your Phone (optional)</Label>
              <Input
                id="contact_phone"
                type="tel"
                placeholder="0712345678"
                value={formData.contact_phone}
                onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
              />
            </div>
          </div>

          <Button type="submit" variant="hero" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                Submit Route Suggestion
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
