
-- Create fleet service requests table for organizations
CREATE TABLE public.fleet_service_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  organization_name text NOT NULL,
  contact_person text NOT NULL,
  contact_email text,
  contact_phone text NOT NULL,
  fleet_size integer DEFAULT 1,
  service_type text NOT NULL, -- 'maintenance', 'inspection', 'pre-purchase', 'fleet-setup'
  vehicle_details text,
  description text,
  preferred_date date,
  urgency text DEFAULT 'normal', -- 'low', 'normal', 'high', 'urgent'
  location text NOT NULL,
  status text NOT NULL DEFAULT 'pending', -- 'pending', 'reviewed', 'quoted', 'in-progress', 'completed', 'cancelled'
  admin_notes text,
  quoted_price numeric,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.fleet_service_requests ENABLE ROW LEVEL SECURITY;

-- Anyone can create a fleet service request (even unauthenticated orgs)
CREATE POLICY "Anyone can create fleet service requests"
ON public.fleet_service_requests FOR INSERT
WITH CHECK (true);

-- Authenticated users can view their own requests
CREATE POLICY "Users can view own fleet requests"
ON public.fleet_service_requests FOR SELECT
USING (auth.uid() = user_id);

-- Admins can view all
CREATE POLICY "Admins can view all fleet requests"
ON public.fleet_service_requests FOR SELECT
USING (EXISTS (
  SELECT 1 FROM user_roles
  WHERE user_roles.user_id = auth.uid()
  AND user_roles.role = ANY(ARRAY['admin'::app_role, 'supervisor'::app_role])
));

-- Admins can update
CREATE POLICY "Admins can update fleet requests"
ON public.fleet_service_requests FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM user_roles
  WHERE user_roles.user_id = auth.uid()
  AND user_roles.role = ANY(ARRAY['admin'::app_role, 'supervisor'::app_role])
));

-- Trigger for updated_at
CREATE TRIGGER update_fleet_service_requests_updated_at
BEFORE UPDATE ON public.fleet_service_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
