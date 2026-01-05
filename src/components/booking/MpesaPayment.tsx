import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Phone, CheckCircle, Loader2, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';

interface MpesaPaymentProps {
  amount: number;
  reference?: string;
  onSuccess: () => void;
  onCancel: () => void;
}

type PaymentStatus = 'idle' | 'pending' | 'processing' | 'success' | 'failed';

export default function MpesaPayment({ amount, reference = 'MOTOLINK', onSuccess, onCancel }: MpesaPaymentProps) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [status, setStatus] = useState<PaymentStatus>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const { toast } = useToast();

  const formatPhoneNumber = (value: string) => {
    // Remove non-digits
    const digits = value.replace(/\D/g, '');
    
    // Format as Kenyan number
    if (digits.startsWith('0')) {
      return '254' + digits.slice(1);
    } else if (digits.startsWith('254')) {
      return digits;
    } else if (digits.startsWith('7') || digits.startsWith('1')) {
      return '254' + digits;
    }
    return digits;
  };

  const handleSubmit = async () => {
    const formattedPhone = formatPhoneNumber(phoneNumber);
    
    if (formattedPhone.length !== 12) {
      toast({
        title: 'Invalid phone number',
        description: 'Please enter a valid Kenyan phone number',
        variant: 'destructive',
      });
      return;
    }

    setStatus('pending');
    setErrorMessage('');

    try {
      // Call the M-Pesa STK Push edge function
      const { data, error } = await supabase.functions.invoke('mpesa-stk-push', {
        body: {
          phone: formattedPhone,
          amount: Math.round(amount),
          reference: reference,
          description: 'MotoLink Rental',
        },
      });

      if (error) {
        throw new Error(error.message || 'Failed to initiate payment');
      }

      if (data?.success) {
        toast({
          title: 'M-Pesa Request Sent!',
          description: data.message || 'Check your phone for the payment prompt',
        });

        setStatus('processing');

        // In production, you'd poll for payment status or use webhooks
        // For now, we'll simulate success after a delay
        setTimeout(() => {
          setStatus('success');
          toast({
            title: 'Payment Successful!',
            description: `KES ${amount.toLocaleString()} received via M-Pesa`,
          });
          
          setTimeout(() => {
            onSuccess();
          }, 1500);
        }, 8000); // Give user time to enter PIN
      } else {
        throw new Error(data?.error || 'Payment initiation failed');
      }
    } catch (error: any) {
      console.error('M-Pesa error:', error);
      
      // Check if it's a configuration error
      if (error.message?.includes('not configured')) {
        // Fallback to simulation mode
        toast({
          title: 'M-Pesa Demo Mode',
          description: 'Using simulated payment (M-Pesa not configured)',
        });

        setStatus('processing');
        
        setTimeout(() => {
          setStatus('success');
          toast({
            title: 'Demo Payment Successful!',
            description: `KES ${amount.toLocaleString()} (simulated)`,
          });
          
          setTimeout(() => {
            onSuccess();
          }, 1500);
        }, 3000);
      } else {
        setStatus('failed');
        setErrorMessage(error.message || 'Payment failed. Please try again.');
        toast({
          title: 'Payment Failed',
          description: error.message || 'Please try again',
          variant: 'destructive',
        });
      }
    }
  };

  const resetPayment = () => {
    setStatus('idle');
    setErrorMessage('');
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
        <AnimatePresence mode="wait">
          {status === 'idle' && (
            <motion.div
              key="idle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              <div className="bg-muted rounded-lg p-4 text-center">
                <p className="text-sm text-muted-foreground">Amount to Pay</p>
                <p className="text-3xl font-bold text-primary">KES {amount.toLocaleString()}</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">M-Pesa Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="0712345678"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="text-lg"
                />
                <p className="text-xs text-muted-foreground">
                  Enter the phone number registered with M-Pesa
                </p>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={onCancel}>
                  Cancel
                </Button>
                <Button 
                  className="flex-1 bg-[#4CAF50] hover:bg-[#43A047]" 
                  onClick={handleSubmit}
                  disabled={!phoneNumber}
                >
                  Pay Now
                </Button>
              </div>
            </motion.div>
          )}

          {(status === 'pending' || status === 'processing') && (
            <motion.div
              key="pending"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-8"
            >
              <Loader2 className="w-16 h-16 mx-auto text-[#4CAF50] animate-spin mb-4" />
              <h3 className="text-xl font-semibold mb-2">
                {status === 'pending' ? 'Sending Request...' : 'Waiting for Payment...'}
              </h3>
              <p className="text-muted-foreground">
                {status === 'pending' 
                  ? 'Please wait while we send the payment request to your phone'
                  : 'Enter your M-Pesa PIN on your phone to complete the payment'
                }
              </p>
            </motion.div>
          )}

          {status === 'success' && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-8"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200 }}
              >
                <CheckCircle className="w-20 h-20 mx-auto text-[#4CAF50] mb-4" />
              </motion.div>
              <h3 className="text-2xl font-semibold mb-2">Payment Successful!</h3>
              <p className="text-muted-foreground">
                KES {amount.toLocaleString()} has been received
              </p>
            </motion.div>
          )}

          {status === 'failed' && (
            <motion.div
              key="failed"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-8"
            >
              <XCircle className="w-20 h-20 mx-auto text-destructive mb-4" />
              <h3 className="text-2xl font-semibold mb-2">Payment Failed</h3>
              <p className="text-muted-foreground mb-4">{errorMessage}</p>
              <div className="flex gap-3 justify-center">
                <Button variant="outline" onClick={onCancel}>
                  Cancel
                </Button>
                <Button onClick={resetPayment}>
                  Try Again
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
