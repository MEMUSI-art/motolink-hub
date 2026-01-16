import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Phone, Clock, PhoneCall } from 'lucide-react';
import { motion } from 'framer-motion';

interface MpesaPaymentProps {
  amount: number;
  reference?: string;
  onSuccess: () => void;
  onCancel: () => void;
}

const COMPANY_PHONE = '+254 700 123 456'; // Replace with actual company phone

export default function MpesaPayment({ amount, onCancel }: MpesaPaymentProps) {
  const handleCall = () => {
    window.location.href = `tel:${COMPANY_PHONE.replace(/\s/g, '')}`;
  };

  return (
    <Card className="border-0 shadow-none">
      <CardHeader className="px-0 pt-0">
        <CardTitle className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-lg bg-[#4CAF50]/10 flex items-center justify-center">
            <Phone className="w-5 h-5 text-[#4CAF50]" />
          </div>
          M-Pesa Payment
        </CardTitle>
      </CardHeader>
      <CardContent className="px-0 pb-0">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-4"
        >
          {/* Amount Display */}
          <div className="bg-muted rounded-lg p-4 text-center">
            <p className="text-sm text-muted-foreground">Amount to Pay</p>
            <p className="text-3xl font-bold text-primary">KES {amount.toLocaleString()}</p>
          </div>

          {/* Coming Soon Badge */}
          <div className="flex items-center justify-center gap-2 py-3 px-4 bg-amber-500/10 rounded-lg border border-amber-500/20">
            <Clock className="w-5 h-5 text-amber-500" />
            <span className="font-semibold text-amber-600">M-Pesa Integration Coming Soon!</span>
          </div>

          {/* Call to Pay Section */}
          <div className="bg-primary/5 rounded-lg p-4 space-y-3">
            <p className="text-center text-sm text-muted-foreground">
              For now, please call us to complete your payment:
            </p>
            
            <Button 
              className="w-full bg-[#4CAF50] hover:bg-[#43A047] text-lg py-6" 
              onClick={handleCall}
            >
              <PhoneCall className="w-5 h-5 mr-2" />
              Call {COMPANY_PHONE}
            </Button>

            <p className="text-xs text-center text-muted-foreground">
              Our team will assist you with M-Pesa payment and confirm your booking
            </p>
          </div>

          {/* Cancel Button */}
          <Button variant="outline" className="w-full" onClick={onCancel}>
            Cancel Booking
          </Button>
        </motion.div>
      </CardContent>
    </Card>
  );
}
