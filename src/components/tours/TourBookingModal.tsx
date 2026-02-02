import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Users, Phone, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface TourBookingModalProps {
  tour: any;
  isOpen: boolean;
  onClose: () => void;
}

export default function TourBookingModal({ tour, isOpen, onClose }: TourBookingModalProps) {
  const navigate = useNavigate();
  const { user, isLoggedIn } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tourDate, setTourDate] = useState<Date | undefined>();
  const [participants, setParticipants] = useState(1);
  const [phone, setPhone] = useState('');
  const [specialRequests, setSpecialRequests] = useState('');

  if (!tour) return null;

  const totalPrice = tour.price_per_person * participants;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isLoggedIn || !user) {
      toast.error('Please login to book a tour');
      onClose();
      navigate('/auth');
      return;
    }

    if (!tourDate || !phone) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase.from('tour_bookings').insert({
        tour_id: tour.id,
        user_id: user.id,
        tour_date: format(tourDate, 'yyyy-MM-dd'),
        participants,
        total_price: totalPrice,
        special_requests: specialRequests || null,
        contact_phone: phone,
        status: 'pending',
        payment_status: 'unpaid',
      });

      if (error) throw error;

      toast.success('Tour booked successfully! We\'ll contact you shortly to confirm.');
      onClose();
    } catch (error) {
      console.error('Error booking tour:', error);
      toast.error('Failed to book tour. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">Book Tour</DialogTitle>
        </DialogHeader>

        <div className="mb-4 p-4 bg-muted rounded-lg">
          <h3 className="font-semibold text-foreground">{tour.title}</h3>
          <p className="text-sm text-muted-foreground">{tour.duration_hours} hours • {tour.difficulty}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Tour Date *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left font-normal">
                  <Calendar className="mr-2 h-4 w-4" />
                  {tourDate ? format(tourDate, 'PPP') : 'Select a date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarComponent
                  mode="single"
                  selected={tourDate}
                  onSelect={setTourDate}
                  disabled={(date) => date < new Date()}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div>
            <Label htmlFor="participants">Number of Participants *</Label>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-muted-foreground" />
              <Input
                id="participants"
                type="number"
                min={1}
                max={tour.max_participants}
                value={participants}
                onChange={(e) => setParticipants(parseInt(e.target.value) || 1)}
                className="flex-1"
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Max {tour.max_participants} participants
            </p>
          </div>

          <div>
            <Label htmlFor="phone">Phone Number *</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="phone"
                type="tel"
                placeholder="0712345678"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="pl-10"
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="requests">Special Requests</Label>
            <Textarea
              id="requests"
              placeholder="Any dietary requirements, accessibility needs, etc."
              value={specialRequests}
              onChange={(e) => setSpecialRequests(e.target.value)}
              rows={3}
            />
          </div>

          <div className="p-4 bg-primary/10 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">
                {formatPrice(tour.price_per_person)} × {participants} {participants === 1 ? 'person' : 'people'}
              </span>
              <span className="font-display text-2xl text-primary">
                {formatPrice(totalPrice)}
              </span>
            </div>
          </div>

          <Button type="submit" variant="hero" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Booking...
              </>
            ) : (
              'Confirm Booking'
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}