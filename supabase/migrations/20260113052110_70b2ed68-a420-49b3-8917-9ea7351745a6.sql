-- Create loyalty_points table to track user points
CREATE TABLE public.loyalty_points (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  total_points INTEGER NOT NULL DEFAULT 0,
  lifetime_points INTEGER NOT NULL DEFAULT 0,
  tier TEXT NOT NULL DEFAULT 'bronze' CHECK (tier IN ('bronze', 'silver', 'gold', 'platinum')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Create points_transactions table to track points history
CREATE TABLE public.points_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  points INTEGER NOT NULL,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('earned', 'redeemed', 'expired', 'bonus')),
  description TEXT,
  reference_id UUID,
  reference_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create rewards table for available rewards
CREATE TABLE public.rewards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  points_required INTEGER NOT NULL,
  reward_type TEXT NOT NULL CHECK (reward_type IN ('discount_percent', 'discount_fixed', 'free_gear', 'free_day')),
  reward_value NUMERIC NOT NULL,
  min_tier TEXT DEFAULT 'bronze' CHECK (min_tier IN ('bronze', 'silver', 'gold', 'platinum')),
  active BOOLEAN DEFAULT true,
  quantity_available INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_rewards table for redeemed rewards
CREATE TABLE public.user_rewards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  reward_id UUID REFERENCES public.rewards(id),
  reward_code TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'used', 'expired')),
  expires_at TIMESTAMP WITH TIME ZONE,
  used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.loyalty_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.points_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_rewards ENABLE ROW LEVEL SECURITY;

-- Loyalty points policies
CREATE POLICY "Users can view their own loyalty points" ON public.loyalty_points FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "System can insert loyalty points" ON public.loyalty_points FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "System can update loyalty points" ON public.loyalty_points FOR UPDATE USING (auth.uid() = user_id);

-- Points transactions policies
CREATE POLICY "Users can view their own transactions" ON public.points_transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "System can insert transactions" ON public.points_transactions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Rewards policies (public read for browsing)
CREATE POLICY "Anyone can view active rewards" ON public.rewards FOR SELECT USING (active = true);
CREATE POLICY "Admins can manage rewards" ON public.rewards FOR ALL USING (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'supervisor'))
);

-- User rewards policies
CREATE POLICY "Users can view their own rewards" ON public.user_rewards FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can redeem rewards" ON public.user_rewards FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can use their rewards" ON public.user_rewards FOR UPDATE USING (auth.uid() = user_id);

-- Create updated_at triggers
CREATE TRIGGER update_loyalty_points_updated_at BEFORE UPDATE ON public.loyalty_points FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_rewards_updated_at BEFORE UPDATE ON public.rewards FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample rewards
INSERT INTO public.rewards (name, description, points_required, reward_type, reward_value, min_tier) VALUES
  ('10% Off Next Rental', 'Get 10% discount on your next bike rental', 500, 'discount_percent', 10, 'bronze'),
  ('KES 500 Off', 'Get KES 500 off your next booking', 750, 'discount_fixed', 500, 'bronze'),
  ('Free Helmet Rental', 'Enjoy a free helmet with your next ride', 300, 'free_gear', 1, 'bronze'),
  ('Free Extra Day', 'Add an extra day to your rental for free', 1500, 'free_day', 1, 'silver'),
  ('20% Off Next Rental', 'Get 20% discount on your next bike rental', 1000, 'discount_percent', 20, 'silver'),
  ('KES 1500 Off', 'Get KES 1500 off premium bikes', 2000, 'discount_fixed', 1500, 'gold'),
  ('VIP Support', 'Priority customer support for 30 days', 2500, 'discount_percent', 0, 'platinum');