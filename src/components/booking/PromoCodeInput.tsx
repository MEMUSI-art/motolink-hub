import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tag, Loader2, Check, X } from 'lucide-react';
import { toast } from 'sonner';

interface PromoCode {
  id: string;
  code: string;
  description: string | null;
  discount_type: string;
  discount_value: number;
  min_order_value: number;
}

interface PromoCodeInputProps {
  subtotal: number;
  onPromoApplied: (promo: PromoCode | null, discount: number) => void;
}

export default function PromoCodeInput({ subtotal, onPromoApplied }: PromoCodeInputProps) {
  const [code, setCode] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [appliedPromo, setAppliedPromo] = useState<PromoCode | null>(null);

  const validatePromo = async () => {
    if (!code.trim()) {
      toast.error('Please enter a promo code');
      return;
    }

    setIsValidating(true);
    try {
      const { data, error } = await supabase
        .from('promo_codes')
        .select('*')
        .eq('code', code.toUpperCase().trim())
        .eq('active', true)
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        toast.error('Invalid promo code');
        onPromoApplied(null, 0);
        return;
      }

      // Check minimum order value
      if (subtotal < (data.min_order_value || 0)) {
        toast.error(`Minimum order of KES ${data.min_order_value?.toLocaleString()} required`);
        return;
      }

      // Check max uses
      if (data.max_uses && data.current_uses >= data.max_uses) {
        toast.error('This promo code has reached its usage limit');
        return;
      }

      // Check validity dates
      const now = new Date();
      if (data.valid_until && new Date(data.valid_until) < now) {
        toast.error('This promo code has expired');
        return;
      }

      // Calculate discount
      let discount = 0;
      if (data.discount_type === 'percentage') {
        discount = Math.round(subtotal * (data.discount_value / 100));
      } else {
        discount = Math.min(data.discount_value, subtotal);
      }

      setAppliedPromo(data);
      onPromoApplied(data, discount);
      toast.success(`Promo code applied! You save KES ${discount.toLocaleString()}`);
    } catch (error) {
      console.error('Promo validation error:', error);
      toast.error('Failed to validate promo code');
    } finally {
      setIsValidating(false);
    }
  };

  const removePromo = () => {
    setCode('');
    setAppliedPromo(null);
    onPromoApplied(null, 0);
  };

  if (appliedPromo) {
    return (
      <div className="flex items-center justify-between p-3 bg-success/10 border border-success/30 rounded-lg">
        <div className="flex items-center gap-2">
          <Check className="w-4 h-4 text-success" />
          <div>
            <p className="text-sm font-medium text-success">{appliedPromo.code}</p>
            <p className="text-xs text-muted-foreground">
              {appliedPromo.discount_type === 'percentage' 
                ? `${appliedPromo.discount_value}% off` 
                : `KES ${appliedPromo.discount_value.toLocaleString()} off`}
            </p>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={removePromo}>
          <X className="w-4 h-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Tag className="w-4 h-4 text-muted-foreground" />
        <span className="text-sm font-medium">Have a promo code?</span>
      </div>
      <div className="flex gap-2">
        <Input
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="Enter code"
          className="flex-1"
          disabled={isValidating}
        />
        <Button 
          type="button" 
          variant="outline" 
          onClick={validatePromo}
          disabled={isValidating || !code.trim()}
        >
          {isValidating ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            'Apply'
          )}
        </Button>
      </div>
      <div className="flex gap-2">
        <Badge variant="outline" className="text-xs cursor-pointer hover:bg-primary/10" onClick={() => setCode('WELCOME10')}>
          WELCOME10
        </Badge>
        <Badge variant="outline" className="text-xs cursor-pointer hover:bg-primary/10" onClick={() => setCode('MOTOLINK500')}>
          MOTOLINK500
        </Badge>
      </div>
    </div>
  );
}
