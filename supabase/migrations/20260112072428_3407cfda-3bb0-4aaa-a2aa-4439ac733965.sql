-- =====================
-- PHASE 1: PROMO CODES
-- =====================
CREATE TABLE public.promo_codes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  description TEXT,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value NUMERIC NOT NULL CHECK (discount_value > 0),
  min_order_value NUMERIC DEFAULT 0,
  max_uses INTEGER,
  current_uses INTEGER DEFAULT 0,
  valid_from TIMESTAMP WITH TIME ZONE DEFAULT now(),
  valid_until TIMESTAMP WITH TIME ZONE,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.promo_codes ENABLE ROW LEVEL SECURITY;

-- Everyone can view active promo codes (for validation)
CREATE POLICY "Anyone can view active promo codes"
ON public.promo_codes FOR SELECT
USING (active = true);

-- Only admins can manage promo codes
CREATE POLICY "Admins can manage promo codes"
ON public.promo_codes FOR ALL
USING (EXISTS (
  SELECT 1 FROM public.user_roles 
  WHERE user_id = auth.uid() AND role IN ('admin', 'supervisor')
));

-- =====================
-- PHASE 1: GEAR RENTAL
-- =====================
CREATE TABLE public.gear_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL CHECK (category IN ('helmet', 'jacket', 'gloves', 'boots', 'accessories')),
  price_per_day NUMERIC NOT NULL CHECK (price_per_day >= 0),
  quantity_available INTEGER NOT NULL DEFAULT 1,
  image TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.gear_items ENABLE ROW LEVEL SECURITY;

-- Everyone can view active gear
CREATE POLICY "Anyone can view active gear"
ON public.gear_items FOR SELECT
USING (active = true);

-- Admins can manage gear
CREATE POLICY "Admins can manage gear"
ON public.gear_items FOR ALL
USING (EXISTS (
  SELECT 1 FROM public.user_roles 
  WHERE user_id = auth.uid() AND role IN ('admin', 'supervisor')
));

-- Booking gear junction table
CREATE TABLE public.booking_gear (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE,
  gear_id UUID REFERENCES public.gear_items(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1,
  price_per_day NUMERIC NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.booking_gear ENABLE ROW LEVEL SECURITY;

-- Users can view their own booking gear
CREATE POLICY "Users can view own booking gear"
ON public.booking_gear FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.bookings 
  WHERE bookings.id = booking_gear.booking_id AND bookings.user_id = auth.uid()
));

-- Users can add gear to their bookings
CREATE POLICY "Users can add gear to own bookings"
ON public.booking_gear FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM public.bookings 
  WHERE bookings.id = booking_gear.booking_id AND bookings.user_id = auth.uid()
));

-- Admins can manage all booking gear
CREATE POLICY "Admins can manage booking gear"
ON public.booking_gear FOR ALL
USING (EXISTS (
  SELECT 1 FROM public.user_roles 
  WHERE user_id = auth.uid() AND role IN ('admin', 'supervisor')
));

-- =====================
-- PHASE 1: EMERGENCY CONTACTS
-- =====================
CREATE TABLE public.emergency_contacts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  relationship TEXT,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.emergency_contacts ENABLE ROW LEVEL SECURITY;

-- Users can manage their own emergency contacts
CREATE POLICY "Users can view own emergency contacts"
ON public.emergency_contacts FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create own emergency contacts"
ON public.emergency_contacts FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own emergency contacts"
ON public.emergency_contacts FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own emergency contacts"
ON public.emergency_contacts FOR DELETE
USING (auth.uid() = user_id);

-- Admins can view all emergency contacts (for SOS situations)
CREATE POLICY "Admins can view all emergency contacts"
ON public.emergency_contacts FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.user_roles 
  WHERE user_id = auth.uid() AND role IN ('admin', 'supervisor')
));

-- =====================
-- ADD PROMO CODE TO BOOKINGS
-- =====================
ALTER TABLE public.bookings 
ADD COLUMN promo_code TEXT,
ADD COLUMN discount_amount NUMERIC DEFAULT 0,
ADD COLUMN gear_total NUMERIC DEFAULT 0;

-- =====================
-- INSERT SAMPLE GEAR ITEMS
-- =====================
INSERT INTO public.gear_items (name, description, category, price_per_day, quantity_available) VALUES
('Standard Helmet', 'DOT-certified full-face helmet', 'helmet', 200, 10),
('Premium Helmet', 'ECE-certified modular helmet with Bluetooth', 'helmet', 400, 5),
('Riding Jacket', 'Armored textile jacket with ventilation', 'jacket', 300, 8),
('Leather Gloves', 'Full leather riding gloves with knuckle protection', 'gloves', 150, 12),
('Riding Boots', 'Ankle-protection motorcycle boots', 'boots', 250, 6),
('Rain Gear Set', 'Waterproof jacket and pants combo', 'accessories', 200, 10),
('Tank Bag', 'Magnetic tank bag for storage', 'accessories', 100, 8);

-- =====================
-- INSERT SAMPLE PROMO CODES
-- =====================
INSERT INTO public.promo_codes (code, description, discount_type, discount_value, min_order_value, max_uses) VALUES
('WELCOME10', 'Welcome discount - 10% off first rental', 'percentage', 10, 1000, 100),
('MOTOLINK500', 'KES 500 off any booking', 'fixed', 500, 2000, 50),
('WEEKEND20', 'Weekend special - 20% off', 'percentage', 20, 3000, 30);

-- Update timestamp trigger for new tables
CREATE TRIGGER update_promo_codes_updated_at
BEFORE UPDATE ON public.promo_codes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_gear_items_updated_at
BEFORE UPDATE ON public.gear_items
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_emergency_contacts_updated_at
BEFORE UPDATE ON public.emergency_contacts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();