-- Create fleet_maintenance table to track bike servicing schedules
CREATE TABLE public.fleet_maintenance (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  bike_id UUID REFERENCES public.bikes(id) ON DELETE CASCADE,
  bike_name TEXT NOT NULL,
  maintenance_type TEXT NOT NULL,
  description TEXT,
  scheduled_date DATE NOT NULL,
  completed_date DATE,
  status TEXT NOT NULL DEFAULT 'scheduled',
  priority TEXT NOT NULL DEFAULT 'normal',
  cost NUMERIC(10,2),
  notes TEXT,
  technician TEXT,
  mileage INTEGER,
  next_service_mileage INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.fleet_maintenance ENABLE ROW LEVEL SECURITY;

-- Policies - Only admins and supervisors can manage maintenance
CREATE POLICY "Admins and supervisors can view all maintenance" 
ON public.fleet_maintenance 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'supervisor')
  )
);

CREATE POLICY "Admins and supervisors can create maintenance" 
ON public.fleet_maintenance 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'supervisor')
  )
);

CREATE POLICY "Admins and supervisors can update maintenance" 
ON public.fleet_maintenance 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'supervisor')
  )
);

CREATE POLICY "Admins and supervisors can delete maintenance" 
ON public.fleet_maintenance 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'supervisor')
  )
);

-- Add trigger for updated_at
CREATE TRIGGER update_fleet_maintenance_updated_at
BEFORE UPDATE ON public.fleet_maintenance
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for fleet_maintenance
ALTER PUBLICATION supabase_realtime ADD TABLE public.fleet_maintenance;

-- Insert sample maintenance records
INSERT INTO public.fleet_maintenance (bike_name, maintenance_type, description, scheduled_date, status, priority, cost, technician, mileage) VALUES
('Honda Activa 6G', 'Oil Change', 'Regular oil change and filter replacement', CURRENT_DATE + INTERVAL '3 days', 'scheduled', 'normal', 1500, 'John Mechanic', 5000),
('TVS Apache RTR 160', 'Brake Inspection', 'Full brake system check and pad replacement', CURRENT_DATE + INTERVAL '1 day', 'scheduled', 'high', 3500, 'Peter Fundi', 12000),
('Royal Enfield Classic 350', 'Full Service', 'Complete service including chain, sprocket, and tune-up', CURRENT_DATE - INTERVAL '2 days', 'completed', 'normal', 8500, 'John Mechanic', 25000),
('Yamaha FZ-S', 'Tire Replacement', 'Front and rear tire replacement', CURRENT_DATE + INTERVAL '7 days', 'scheduled', 'normal', 12000, NULL, 18000),
('Roam Air', 'Battery Check', 'EV battery health check and calibration', CURRENT_DATE, 'in_progress', 'high', 2000, 'EV Specialist', 8000);