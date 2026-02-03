-- Create route_requests table for clients to submit route suggestions
CREATE TABLE public.route_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  start_location TEXT NOT NULL,
  end_location TEXT NOT NULL,
  estimated_distance_km NUMERIC,
  difficulty TEXT DEFAULT 'moderate',
  terrain_types TEXT[] DEFAULT '{}',
  points_of_interest TEXT[] DEFAULT '{}',
  contact_email TEXT,
  contact_phone TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.route_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can create route requests" 
ON public.route_requests 
FOR INSERT 
WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can view own route requests" 
ON public.route_requests 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all route requests" 
ON public.route_requests 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM user_roles 
  WHERE user_roles.user_id = auth.uid() 
  AND user_roles.role IN ('admin', 'supervisor')
));

CREATE POLICY "Admins can update any route request" 
ON public.route_requests 
FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM user_roles 
  WHERE user_roles.user_id = auth.uid() 
  AND user_roles.role IN ('admin', 'supervisor')
));

CREATE POLICY "Admins can delete route requests" 
ON public.route_requests 
FOR DELETE 
USING (EXISTS (
  SELECT 1 FROM user_roles 
  WHERE user_roles.user_id = auth.uid() 
  AND user_roles.role IN ('admin', 'supervisor')
));

-- Add trigger for updated_at
CREATE TRIGGER update_route_requests_updated_at
  BEFORE UPDATE ON public.route_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();