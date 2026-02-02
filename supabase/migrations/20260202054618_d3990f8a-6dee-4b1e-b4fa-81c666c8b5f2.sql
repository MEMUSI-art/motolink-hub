-- =============================================
-- VEHICLE SALES MARKETPLACE
-- =============================================

-- Create vehicle sales listings table
CREATE TABLE public.vehicle_sales (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  vehicle_type TEXT NOT NULL CHECK (vehicle_type IN ('motorcycle', 'buggy', 'scooter', 'atv')),
  listing_type TEXT NOT NULL DEFAULT 'user' CHECK (listing_type IN ('user', 'motolink')),
  title TEXT NOT NULL,
  brand TEXT NOT NULL,
  model TEXT NOT NULL,
  year INTEGER,
  mileage INTEGER,
  condition TEXT NOT NULL CHECK (condition IN ('new', 'like_new', 'excellent', 'good', 'fair')),
  price NUMERIC NOT NULL,
  negotiable BOOLEAN DEFAULT true,
  description TEXT,
  engine TEXT,
  power TEXT,
  color TEXT,
  location TEXT NOT NULL,
  images TEXT[] DEFAULT '{}',
  contact_phone TEXT NOT NULL,
  contact_email TEXT,
  features TEXT[] DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'sold', 'archived')),
  views_count INTEGER DEFAULT 0,
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.vehicle_sales ENABLE ROW LEVEL SECURITY;

-- RLS Policies for vehicle_sales
CREATE POLICY "Anyone can view approved vehicle sales"
ON public.vehicle_sales FOR SELECT
USING (status = 'approved' OR auth.uid() = user_id OR EXISTS (
  SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'supervisor')
));

CREATE POLICY "Users can create vehicle listings"
ON public.vehicle_sales FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own pending listings"
ON public.vehicle_sales FOR UPDATE
USING (auth.uid() = user_id AND status IN ('pending', 'rejected'));

CREATE POLICY "Admins can update any vehicle listing"
ON public.vehicle_sales FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'supervisor')
));

CREATE POLICY "Admins can delete vehicle listings"
ON public.vehicle_sales FOR DELETE
USING (EXISTS (
  SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'supervisor')
));

-- =============================================
-- MAINTENANCE PROGRESS TRACKING
-- =============================================

-- Add progress tracking columns to services table
ALTER TABLE public.services 
ADD COLUMN IF NOT EXISTS progress_stage TEXT DEFAULT 'received' CHECK (progress_stage IN ('received', 'diagnosing', 'parts_ordered', 'repairing', 'testing', 'ready', 'completed')),
ADD COLUMN IF NOT EXISTS assigned_technician TEXT,
ADD COLUMN IF NOT EXISTS estimated_completion DATE,
ADD COLUMN IF NOT EXISTS actual_completion DATE,
ADD COLUMN IF NOT EXISTS progress_photos TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS cost_breakdown JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS technician_notes JSONB DEFAULT '[]'::jsonb;

-- Create maintenance progress history table
CREATE TABLE public.maintenance_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  service_id UUID REFERENCES public.services(id) ON DELETE CASCADE NOT NULL,
  stage TEXT NOT NULL,
  note TEXT,
  photo_url TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.maintenance_progress ENABLE ROW LEVEL SECURITY;

-- RLS Policies for maintenance_progress
CREATE POLICY "Users can view own maintenance progress"
ON public.maintenance_progress FOR SELECT
USING (EXISTS (
  SELECT 1 FROM services WHERE services.id = maintenance_progress.service_id AND services.user_id = auth.uid()
));

CREATE POLICY "Admins can view all maintenance progress"
ON public.maintenance_progress FOR SELECT
USING (EXISTS (
  SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'supervisor')
));

CREATE POLICY "Admins can create maintenance progress"
ON public.maintenance_progress FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'supervisor')
));

-- =============================================
-- PARTS SOURCING REQUESTS
-- =============================================

CREATE TABLE public.parts_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  part_name TEXT NOT NULL,
  part_number TEXT,
  bike_make TEXT NOT NULL,
  bike_model TEXT NOT NULL,
  bike_year INTEGER,
  quantity INTEGER DEFAULT 1,
  urgency TEXT DEFAULT 'normal' CHECK (urgency IN ('low', 'normal', 'high', 'urgent')),
  description TEXT,
  images TEXT[] DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sourcing', 'quoted', 'ordered', 'delivered', 'cancelled')),
  quoted_price NUMERIC,
  supplier_notes TEXT,
  admin_notes TEXT,
  contact_phone TEXT NOT NULL,
  contact_email TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.parts_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies for parts_requests
CREATE POLICY "Users can view own parts requests"
ON public.parts_requests FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create parts requests"
ON public.parts_requests FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own pending requests"
ON public.parts_requests FOR UPDATE
USING (auth.uid() = user_id AND status = 'pending');

CREATE POLICY "Admins can view all parts requests"
ON public.parts_requests FOR SELECT
USING (EXISTS (
  SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'supervisor')
));

CREATE POLICY "Admins can update any parts request"
ON public.parts_requests FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'supervisor')
));

-- =============================================
-- TOUR GUIDES & ROUTES
-- =============================================

-- Guided tours table
CREATE TABLE public.guided_tours (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  duration_hours NUMERIC NOT NULL,
  difficulty TEXT DEFAULT 'moderate' CHECK (difficulty IN ('easy', 'moderate', 'challenging', 'expert')),
  max_participants INTEGER DEFAULT 10,
  price_per_person NUMERIC NOT NULL,
  includes TEXT[] DEFAULT '{}',
  requirements TEXT[] DEFAULT '{}',
  meeting_point TEXT NOT NULL,
  route_highlights TEXT[] DEFAULT '{}',
  images TEXT[] DEFAULT '{}',
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.guided_tours ENABLE ROW LEVEL SECURITY;

-- RLS Policies for guided_tours
CREATE POLICY "Anyone can view active tours"
ON public.guided_tours FOR SELECT
USING (active = true OR EXISTS (
  SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'supervisor')
));

CREATE POLICY "Admins can manage tours"
ON public.guided_tours FOR ALL
USING (EXISTS (
  SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'supervisor')
));

-- Tour bookings table
CREATE TABLE public.tour_bookings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tour_id UUID REFERENCES public.guided_tours(id) ON DELETE SET NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  tour_date DATE NOT NULL,
  participants INTEGER DEFAULT 1,
  total_price NUMERIC NOT NULL,
  special_requests TEXT,
  contact_phone TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
  payment_status TEXT DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'partial', 'paid', 'refunded')),
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.tour_bookings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for tour_bookings
CREATE POLICY "Users can view own tour bookings"
ON public.tour_bookings FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create tour bookings"
ON public.tour_bookings FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own pending bookings"
ON public.tour_bookings FOR UPDATE
USING (auth.uid() = user_id AND status = 'pending');

CREATE POLICY "Admins can view all tour bookings"
ON public.tour_bookings FOR SELECT
USING (EXISTS (
  SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'supervisor')
));

CREATE POLICY "Admins can update any tour booking"
ON public.tour_bookings FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'supervisor')
));

-- Self-guided routes table
CREATE TABLE public.self_guided_routes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  distance_km NUMERIC NOT NULL,
  estimated_hours NUMERIC NOT NULL,
  difficulty TEXT DEFAULT 'moderate' CHECK (difficulty IN ('easy', 'moderate', 'challenging', 'expert')),
  terrain_type TEXT[] DEFAULT '{}',
  start_point TEXT NOT NULL,
  end_point TEXT NOT NULL,
  waypoints JSONB DEFAULT '[]'::jsonb,
  points_of_interest JSONB DEFAULT '[]'::jsonb,
  tips TEXT[] DEFAULT '{}',
  images TEXT[] DEFAULT '{}',
  map_url TEXT,
  gpx_file_url TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.self_guided_routes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for self_guided_routes
CREATE POLICY "Anyone can view active routes"
ON public.self_guided_routes FOR SELECT
USING (active = true OR EXISTS (
  SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'supervisor')
));

CREATE POLICY "Admins can manage routes"
ON public.self_guided_routes FOR ALL
USING (EXISTS (
  SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'supervisor')
));

-- Create storage bucket for vehicle sales images
INSERT INTO storage.buckets (id, name, public) VALUES ('vehicle-sales', 'vehicle-sales', true) ON CONFLICT DO NOTHING;

-- Storage policies for vehicle-sales bucket
CREATE POLICY "Anyone can view vehicle sales images"
ON storage.objects FOR SELECT
USING (bucket_id = 'vehicle-sales');

CREATE POLICY "Authenticated users can upload vehicle sales images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'vehicle-sales' AND auth.role() = 'authenticated');

CREATE POLICY "Users can delete own vehicle sales images"
ON storage.objects FOR DELETE
USING (bucket_id = 'vehicle-sales' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Create storage bucket for parts request images
INSERT INTO storage.buckets (id, name, public) VALUES ('parts-requests', 'parts-requests', true) ON CONFLICT DO NOTHING;

-- Storage policies for parts-requests bucket
CREATE POLICY "Anyone can view parts request images"
ON storage.objects FOR SELECT
USING (bucket_id = 'parts-requests');

CREATE POLICY "Authenticated users can upload parts request images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'parts-requests' AND auth.role() = 'authenticated');

-- Create storage bucket for tour images
INSERT INTO storage.buckets (id, name, public) VALUES ('tour-images', 'tour-images', true) ON CONFLICT DO NOTHING;

-- Storage policies for tour-images bucket
CREATE POLICY "Anyone can view tour images"
ON storage.objects FOR SELECT
USING (bucket_id = 'tour-images');

CREATE POLICY "Admins can manage tour images"
ON storage.objects FOR ALL
USING (bucket_id = 'tour-images' AND EXISTS (
  SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'supervisor')
));