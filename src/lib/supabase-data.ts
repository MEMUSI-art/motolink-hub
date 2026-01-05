import { supabase } from "@/integrations/supabase/client";

// Types for our data
export interface Profile {
  id: string;
  email: string | null;
  name: string | null;
  phone: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserRole {
  id: string;
  user_id: string;
  role: 'user' | 'supervisor' | 'admin';
  created_at: string;
}

export interface Bike {
  id: string;
  name: string;
  category: string;
  price: number;
  rating: number | null;
  reviews_count: number | null;
  image: string | null;
  engine: string | null;
  power: string | null;
  seats: number | null;
  available: boolean | null;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface Booking {
  id: string;
  user_id: string;
  bike_id: string | null;
  bike_name: string | null;
  pickup_date: string;
  return_date: string;
  pickup_location: string;
  status: string;
  total_price: number;
  notes: string | null;
  reviewed: boolean | null;
  created_at: string;
  updated_at: string;
}

export interface ServiceBooking {
  id: string;
  user_id: string;
  name: string;
  phone: string;
  bike: string;
  services: unknown;
  preferred_date: string;
  notes: string | null;
  total_price: number;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface Review {
  id: string;
  user_id: string;
  booking_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
}

// Auth helpers
export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};

export const getCurrentSession = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  return session;
};

// Profile functions
export async function getProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();
  
  if (error) throw error;
  return data;
}

export async function updateProfile(userId: string, updates: Partial<Profile>) {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

// User role functions
export async function getUserRole(userId: string): Promise<UserRole | null> {
  const { data, error } = await supabase
    .from('user_roles')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();
  
  if (error) throw error;
  return data;
}

export async function hasRole(userId: string, role: 'user' | 'supervisor' | 'admin'): Promise<boolean> {
  const { data, error } = await supabase
    .from('user_roles')
    .select('id')
    .eq('user_id', userId)
    .eq('role', role)
    .maybeSingle();
  
  if (error) return false;
  return !!data;
}

// Bike functions
export async function getBikes(): Promise<Bike[]> {
  const { data, error } = await supabase
    .from('bikes')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data || [];
}

export async function getBike(id: string): Promise<Bike | null> {
  const { data, error } = await supabase
    .from('bikes')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  
  if (error) throw error;
  return data;
}

export async function getAvailableBikes(): Promise<Bike[]> {
  const { data, error } = await supabase
    .from('bikes')
    .select('*')
    .eq('available', true)
    .order('rating', { ascending: false });
  
  if (error) throw error;
  return data || [];
}

// Booking functions
export async function createBooking(data: {
  bike_id?: string;
  bike_name?: string;
  pickup_date: string;
  return_date: string;
  pickup_location: string;
  total_price: number;
  notes?: string;
}): Promise<Booking> {
  const user = await getCurrentUser();
  if (!user) throw new Error('You must be logged in to book');
  
  const { data: booking, error } = await supabase
    .from('bookings')
    .insert({
      user_id: user.id,
      bike_id: data.bike_id || null,
      bike_name: data.bike_name,
      pickup_date: data.pickup_date,
      return_date: data.return_date,
      pickup_location: data.pickup_location,
      total_price: data.total_price,
      notes: data.notes || null,
      status: 'pending',
      reviewed: false,
    })
    .select()
    .single();
  
  if (error) throw error;
  return booking;
}

export async function getUserBookings(): Promise<Booking[]> {
  const user = await getCurrentUser();
  if (!user) return [];
  
  const { data, error } = await supabase
    .from('bookings')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data || [];
}

export async function cancelBooking(id: string): Promise<Booking> {
  const { data, error } = await supabase
    .from('bookings')
    .update({ status: 'cancelled' })
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

// Service booking functions
export async function createServiceBooking(data: {
  name: string;
  phone: string;
  bike: string;
  services: string[];
  preferred_date: string;
  notes?: string;
  total_price: number;
}): Promise<ServiceBooking> {
  const user = await getCurrentUser();
  if (!user) throw new Error('You must be logged in to book a service');
  
  const { data: service, error } = await supabase
    .from('services')
    .insert({
      user_id: user.id,
      name: data.name,
      phone: data.phone,
      bike: data.bike,
      services: data.services,
      preferred_date: data.preferred_date,
      notes: data.notes || null,
      total_price: data.total_price,
      status: 'pending',
    })
    .select()
    .single();
  
  if (error) throw error;
  return service;
}

export async function getUserServiceBookings(): Promise<ServiceBooking[]> {
  const user = await getCurrentUser();
  if (!user) return [];
  
  const { data, error } = await supabase
    .from('services')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data || [];
}

// Review functions
export async function createReview(data: {
  booking_id: string;
  rating: number;
  comment?: string;
}): Promise<Review> {
  const user = await getCurrentUser();
  if (!user) throw new Error('You must be logged in to review');
  
  // Create the review
  const { data: review, error } = await supabase
    .from('reviews')
    .insert({
      user_id: user.id,
      booking_id: data.booking_id,
      rating: data.rating,
      comment: data.comment || null,
    })
    .select()
    .single();
  
  if (error) throw error;
  
  // Mark booking as reviewed
  await supabase
    .from('bookings')
    .update({ reviewed: true })
    .eq('id', data.booking_id);
  
  return review;
}

export async function getUserReviews(): Promise<Review[]> {
  const user = await getCurrentUser();
  if (!user) return [];
  
  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data || [];
}
