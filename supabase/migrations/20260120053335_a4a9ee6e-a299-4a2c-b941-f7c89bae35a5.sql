-- Create bike_listings table for user bike submissions
CREATE TABLE public.bike_listings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  engine TEXT,
  power TEXT,
  description TEXT,
  price_per_day NUMERIC NOT NULL DEFAULT 0,
  location TEXT NOT NULL,
  images TEXT[] DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'pending',
  contact_phone TEXT NOT NULL,
  contact_email TEXT,
  notes TEXT,
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.bike_listings ENABLE ROW LEVEL SECURITY;

-- Users can view their own listings
CREATE POLICY "Users can view own bike listings"
ON public.bike_listings
FOR SELECT
USING (auth.uid() = user_id);

-- Users can create listings
CREATE POLICY "Users can create bike listings"
ON public.bike_listings
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own pending listings
CREATE POLICY "Users can update own pending listings"
ON public.bike_listings
FOR UPDATE
USING (auth.uid() = user_id AND status = 'pending');

-- Admins can view all listings
CREATE POLICY "Admins can view all bike listings"
ON public.bike_listings
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM user_roles
  WHERE user_roles.user_id = auth.uid()
  AND user_roles.role IN ('admin', 'supervisor')
));

-- Admins can update any listing
CREATE POLICY "Admins can update any bike listing"
ON public.bike_listings
FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM user_roles
  WHERE user_roles.user_id = auth.uid()
  AND user_roles.role IN ('admin', 'supervisor')
));

-- Create storage bucket for bike listing images
INSERT INTO storage.buckets (id, name, public)
VALUES ('bike-listings', 'bike-listings', true);

-- Allow authenticated users to upload bike images
CREATE POLICY "Users can upload bike listing images"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'bike-listings' 
  AND auth.uid() IS NOT NULL
);

-- Allow public read access to bike listing images
CREATE POLICY "Public can view bike listing images"
ON storage.objects
FOR SELECT
USING (bucket_id = 'bike-listings');

-- Allow users to delete their own images (based on path pattern)
CREATE POLICY "Users can delete own bike listing images"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'bike-listings' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Add realtime for bike_listings
ALTER PUBLICATION supabase_realtime ADD TABLE public.bike_listings;