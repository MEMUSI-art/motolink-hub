import PocketBase from 'pocketbase';

// PocketBase client - Update this URL to your PocketBase instance
const POCKETBASE_URL = import.meta.env.VITE_POCKETBASE_URL || 'http://127.0.0.1:8090';

export const pb = new PocketBase(POCKETBASE_URL);

// Disable auto cancellation to prevent issues with concurrent requests
pb.autoCancellation(false);

// Types for our collections
export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  avatar?: string;
  created: string;
  updated: string;
}

export interface Bike {
  id: string;
  name: string;
  category: string;
  price: number;
  rating: number;
  reviews: number;
  image: string;
  engine: string;
  power: string;
  seats: number;
  available: boolean;
  description?: string;
  created: string;
  updated: string;
}

export interface Booking {
  id: string;
  user: string;
  bike: string;
  bike_name?: string;
  pickup_date: string;
  return_date: string;
  pickup_location: string;
  status: 'pending' | 'confirmed' | 'active' | 'completed' | 'cancelled';
  total_price: number;
  notes?: string;
  reviewed?: boolean;
  created: string;
  updated: string;
}

export interface Review {
  id: string;
  user: string;
  booking: string;
  rating: number;
  comment?: string;
  created: string;
  updated: string;
}

// Auth helpers
export const isLoggedIn = () => pb.authStore.isValid;
export const getCurrentUser = () => pb.authStore.model as unknown as User | null;
export const logout = () => pb.authStore.clear();

// Auth functions
export async function login(email: string, password: string) {
  return await pb.collection('users').authWithPassword(email, password);
}

export async function register(email: string, password: string, name: string, phone?: string) {
  const user = await pb.collection('users').create({
    email,
    password,
    passwordConfirm: password,
    name,
    phone,
  });
  
  // Auto login after registration
  await login(email, password);
  return user;
}

// Bike functions
export async function getBikes() {
  return await pb.collection('bikes').getFullList<Bike>({
    sort: '-created',
  });
}

export async function getBike(id: string) {
  return await pb.collection('bikes').getOne<Bike>(id);
}

export async function getAvailableBikes(pickupDate?: string, returnDate?: string) {
  // For now, just return all available bikes
  // In production, you'd check against existing bookings
  return await pb.collection('bikes').getFullList<Bike>({
    filter: 'available = true',
    sort: '-rating',
  });
}

// Booking functions
export async function createBooking(data: {
  bike: string;
  bike_name?: string;
  pickup_date: string;
  return_date: string;
  pickup_location: string;
  total_price: number;
  notes?: string;
}) {
  const user = getCurrentUser();
  if (!user) throw new Error('You must be logged in to book');
  
  return await pb.collection('bookings').create<Booking>({
    ...data,
    user: user.id,
    status: 'pending',
    reviewed: false,
  });
}

export async function getUserBookings() {
  const user = getCurrentUser();
  if (!user) return [];
  
  return await pb.collection('bookings').getFullList<Booking>({
    filter: `user = "${user.id}"`,
    sort: '-created',
    expand: 'bike',
  });
}

export async function cancelBooking(id: string) {
  return await pb.collection('bookings').update<Booking>(id, {
    status: 'cancelled',
  });
}

// Review functions
export async function createReview(data: {
  booking: string;
  rating: number;
  comment?: string;
}) {
  const user = getCurrentUser();
  if (!user) throw new Error('You must be logged in to review');
  
  // Create the review
  const review = await pb.collection('reviews').create<Review>({
    ...data,
    user: user.id,
  });
  
  // Mark booking as reviewed
  await pb.collection('bookings').update(data.booking, {
    reviewed: true,
  });
  
  return review;
}

export async function getUserReviews() {
  const user = getCurrentUser();
  if (!user) return [];
  
  return await pb.collection('reviews').getFullList<Review>({
    filter: `user = "${user.id}"`,
    sort: '-created',
    expand: 'booking',
  });
}

export async function getBikeReviews(bikeId: string) {
  return await pb.collection('reviews').getFullList<Review>({
    filter: `booking.bike = "${bikeId}"`,
    sort: '-created',
    expand: 'user',
  });
}
