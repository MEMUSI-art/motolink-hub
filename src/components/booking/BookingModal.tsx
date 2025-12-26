import { useState } from 'react';
import { motion } from 'framer-motion';
import { format, differenceInDays } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Calendar as CalendarIcon, MapPin, Loader2, AlertCircle, CreditCard } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import MpesaPayment from './MpesaPayment';

// Pickup locations
const pickupLocations = [
  'Kitengela',
  'Mombasa Road',
  'Karen',
  'Westlands',
  'CBD Nairobi',
  'Thika Road Mall',
  'Kilimani',
  'Lavington',
  'Rongai'
];

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  bike: {
    id: string | number;
    name: string;
    price: number;
    image: string;
  };
}

type BookingStep = 'details' | 'payment' | 'complete';

export default function BookingModal({ isOpen, onClose, bike }: BookingModalProps) {
  const { isLoggedIn } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<BookingStep>('details');
  const [pickupDate, setPickupDate] = useState<Date | undefined>();
  const [returnDate, setReturnDate] = useState<Date | undefined>();
  const [pickupLocation, setPickupLocation] = useState('');
  const [notes, setNotes] = useState('');

  const calculateDays = () => {
    if (!pickupDate || !returnDate) return 0;
    return Math.max(1, differenceInDays(returnDate, pickupDate));
  };

  // Price is already in KES
  const totalPriceKES = calculateDays() * bike.price;

  const handleDetailsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!pickupDate || !returnDate) {
      toast.error('Please select pickup and return dates');
      return;
    }

    if (!pickupLocation) {
      toast.error('Please enter a pickup location');
      return;
    }

    if (returnDate < pickupDate) {
      toast.error('Return date must be after pickup date');
      return;
    }

    // Move to payment step
    setStep('payment');
  };

  const handlePaymentSuccess = () => {
    setStep('complete');
    toast.success(`Booking confirmed for ${bike.name}!`, {
      description: `${calculateDays()} days, Total: KES ${totalPriceKES.toLocaleString()}`,
    });
    
    // Close modal after delay
    setTimeout(() => {
      handleClose();
    }, 2000);
  };

  const handleClose = () => {
    onClose();
    // Reset form after a brief delay
    setTimeout(() => {
      setStep('details');
      setPickupDate(undefined);
      setReturnDate(undefined);
      setPickupLocation('');
      setNotes('');
    }, 300);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">
            {step === 'details' && `Book ${bike.name}`}
            {step === 'payment' && 'Complete Payment'}
            {step === 'complete' && 'Booking Confirmed!'}
          </DialogTitle>
          <DialogDescription>
            {step === 'details' && 'Fill in the details below to reserve this motorcycle.'}
            {step === 'payment' && 'Pay with M-Pesa to confirm your booking.'}
            {step === 'complete' && 'Your booking has been confirmed successfully.'}
          </DialogDescription>
        </DialogHeader>

        {!isLoggedIn ? (
          <div className="py-8 text-center space-y-4">
            <AlertCircle className="w-12 h-12 text-amber-500 mx-auto" />
            <div>
              <h3 className="font-semibold text-lg mb-2">Login Required</h3>
              <p className="text-muted-foreground text-sm mb-4">
                Please login or create an account to book a motorcycle.
              </p>
              <Link to="/auth">
                <Button onClick={handleClose}>
                  Login / Sign Up
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <>
            {step === 'details' && (
              <form onSubmit={handleDetailsSubmit} className="space-y-4">
                {/* Bike Preview */}
                <div className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg">
                  <img 
                    src={bike.image} 
                    alt={bike.name} 
                    className="w-20 h-14 object-cover rounded"
                  />
                  <div>
                    <h4 className="font-semibold">{bike.name}</h4>
                    <p className="text-primary font-bold">KES {bike.price.toLocaleString()}/day</p>
                  </div>
                </div>

                {/* Date Selection */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Pickup Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !pickupDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {pickupDate ? format(pickupDate, "PPP") : "Select date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={pickupDate}
                          onSelect={setPickupDate}
                          disabled={(date) => date < new Date()}
                          initialFocus
                          className="pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-2">
                    <Label>Return Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !returnDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {returnDate ? format(returnDate, "PPP") : "Select date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={returnDate}
                          onSelect={setReturnDate}
                          disabled={(date) => date < (pickupDate || new Date())}
                          initialFocus
                          className="pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                {/* Pickup Location */}
                <div className="space-y-2">
                  <Label htmlFor="location">Pickup Location</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground z-10" />
                    <Select value={pickupLocation} onValueChange={setPickupLocation}>
                      <SelectTrigger className="pl-10">
                        <SelectValue placeholder="Select location" />
                      </SelectTrigger>
                      <SelectContent>
                        {pickupLocations.map(loc => (
                          <SelectItem key={loc} value={loc}>{loc}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Notes */}
                <div className="space-y-2">
                  <Label htmlFor="notes">Special Requests (Optional)</Label>
                  <Textarea
                    id="notes"
                    placeholder="Any special requests or requirements..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={2}
                  />
                </div>

                {/* Price Summary */}
                {pickupDate && returnDate && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-primary/10 rounded-lg border border-primary/20"
                  >
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-muted-foreground">
                        KES {bike.price.toLocaleString()} × {calculateDays()} days
                      </span>
                      <span>KES {totalPriceKES.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total (KES)</span>
                      <span className="text-primary">KES {totalPriceKES.toLocaleString()}</span>
                    </div>
                  </motion.div>
                )}

                <DialogFooter className="gap-2">
                  <Button type="button" variant="outline" onClick={handleClose}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isLoading}>
                    <CreditCard className="w-4 h-4 mr-2" />
                    Proceed to Payment
                  </Button>
                </DialogFooter>
              </form>
            )}

            {step === 'payment' && (
              <MpesaPayment
                amount={totalPriceKES}
                onSuccess={handlePaymentSuccess}
                onCancel={() => setStep('details')}
              />
            )}

            {step === 'complete' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-8 text-center"
              >
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-success/20 flex items-center justify-center">
                  <svg className="w-10 h-10 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">Booking Confirmed!</h3>
                <p className="text-muted-foreground">
                  {bike.name} is reserved from {pickupDate && format(pickupDate, 'PPP')} to {returnDate && format(returnDate, 'PPP')}
                </p>
              </motion.div>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
