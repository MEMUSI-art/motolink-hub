-- Fix profiles table: Users can only view their own profile, admins can view all
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;

CREATE POLICY "Users can view own profile"
ON public.profiles
FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role IN ('admin', 'supervisor')
  )
);

-- Fix reviews: Allow public viewing of reviews (for bike browsing)
DROP POLICY IF EXISTS "Users can view own reviews" ON public.reviews;

CREATE POLICY "Reviews are publicly viewable"
ON public.reviews
FOR SELECT
USING (true);

-- Add DELETE policy for users to delete their own reviews
CREATE POLICY "Users can delete own reviews"
ON public.reviews
FOR DELETE
USING (auth.uid() = user_id);

-- Fix newsletter: Require basic validation (email format check done at app level)
-- Keep INSERT open for public subscriptions but add rate limiting consideration in app
-- No change needed for newsletter as this is intentional for marketing

-- Add DELETE policy for booking_gear so users can remove gear from their bookings
CREATE POLICY "Users can delete own booking gear"
ON public.booking_gear
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM bookings
    WHERE bookings.id = booking_gear.booking_id
    AND bookings.user_id = auth.uid()
    AND bookings.status = 'pending'
  )
);