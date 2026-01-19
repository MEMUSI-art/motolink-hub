-- Create SOS requests table
CREATE TABLE public.sos_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  emergency_type TEXT NOT NULL,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  location TEXT NOT NULL,
  latitude DECIMAL(10, 7),
  longitude DECIMAL(10, 7),
  description TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  assigned_to TEXT,
  resolved_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.sos_requests ENABLE ROW LEVEL SECURITY;

-- Users can create SOS requests (authenticated or anonymous via service role)
CREATE POLICY "Anyone can create SOS requests"
ON public.sos_requests
FOR INSERT
WITH CHECK (true);

-- Users can view their own SOS requests
CREATE POLICY "Users can view their own SOS requests"
ON public.sos_requests
FOR SELECT
USING (auth.uid() = user_id);

-- Admins and supervisors can view all SOS requests
CREATE POLICY "Admins can view all SOS requests"
ON public.sos_requests
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role IN ('admin', 'supervisor')
  )
);

-- Admins and supervisors can update SOS requests
CREATE POLICY "Admins can update SOS requests"
ON public.sos_requests
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role IN ('admin', 'supervisor')
  )
);

-- Add timestamp trigger
CREATE TRIGGER update_sos_requests_updated_at
BEFORE UPDATE ON public.sos_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();