import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { 
  Bike, TrendingUp, Clock, Star, DollarSign, 
  Loader2, BarChart3, PieChart, Calendar, MapPin
} from 'lucide-react';
import { motion } from 'framer-motion';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart as RechartsPie, Pie, Cell, LineChart, Line, Legend
} from 'recharts';
import { format, subDays, startOfMonth, endOfMonth, differenceInDays, parseISO } from 'date-fns';

interface BikeData {
  id: string;
  name: string;
  category: string;
  price: number;
  rating: number | null;
  reviews_count: number | null;
  available: boolean | null;
}

interface BookingData {
  id: string;
  bike_id: string | null;
  bike_name: string | null;
  pickup_date: string;
  return_date: string;
  pickup_location: string;
  total_price: number;
  status: string;
  created_at: string;
}

interface BikeAnalytics {
  id: string;
  name: string;
  category: string;
  totalBookings: number;
  totalRevenue: number;
  avgDuration: number;
  utilizationRate: number;
  rating: number | null;
  isAvailable: boolean;
}

const COLORS = ['hsl(var(--primary))', 'hsl(var(--accent))', 'hsl(var(--success))', 'hsl(var(--destructive))', 'hsl(var(--muted))'];
const CATEGORY_COLORS: Record<string, string> = {
  'scooter': '#22c55e',
  'sport': '#ef4444',
  'cruiser': '#f59e0b',
  'electric': '#3b82f6',
  'adventure': '#8b5cf6',
  'standard': '#6b7280'
};

export default function FleetAnalyticsDashboard() {
  const [bikes, setBikes] = useState<BikeData[]>([]);
  const [bookings, setBookings] = useState<BookingData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30');

  useEffect(() => {
    fetchData();
  }, [timeRange]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const startDate = subDays(new Date(), parseInt(timeRange));
      
      const [bikesRes, bookingsRes] = await Promise.all([
        supabase.from('bikes').select('*'),
        supabase.from('bookings')
          .select('*')
          .gte('created_at', startDate.toISOString())
          .neq('status', 'cancelled')
      ]);

      if (bikesRes.data) setBikes(bikesRes.data);
      if (bookingsRes.data) setBookings(bookingsRes.data);
    } catch (error) {
      console.error('Error fetching analytics data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate bike analytics
  const bikeAnalytics: BikeAnalytics[] = useMemo(() => {
    const daysInPeriod = parseInt(timeRange);
    
    return bikes.map(bike => {
      const bikeBookings = bookings.filter(b => 
        b.bike_name === bike.name || b.bike_id === bike.id
      );
      
      const totalRevenue = bikeBookings.reduce((sum, b) => sum + (b.total_price || 0), 0);
      
      const totalDays = bikeBookings.reduce((sum, b) => {
        const start = parseISO(b.pickup_date);
        const end = parseISO(b.return_date);
        return sum + Math.max(1, differenceInDays(end, start));
      }, 0);
      
      const avgDuration = bikeBookings.length > 0 ? totalDays / bikeBookings.length : 0;
      const utilizationRate = Math.min(100, (totalDays / daysInPeriod) * 100);
      
      return {
        id: bike.id,
        name: bike.name,
        category: bike.category,
        totalBookings: bikeBookings.length,
        totalRevenue,
        avgDuration,
        utilizationRate,
        rating: bike.rating,
        isAvailable: bike.available ?? true
      };
    }).sort((a, b) => b.totalRevenue - a.totalRevenue);
  }, [bikes, bookings, timeRange]);

  // Category distribution
  const categoryData = useMemo(() => {
    const categories: Record<string, { count: number; revenue: number }> = {};
    
    bikeAnalytics.forEach(bike => {
      if (!categories[bike.category]) {
        categories[bike.category] = { count: 0, revenue: 0 };
      }
      categories[bike.category].count += bike.totalBookings;
      categories[bike.category].revenue += bike.totalRevenue;
    });
    
    return Object.entries(categories).map(([name, data]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      bookings: data.count,
      revenue: data.revenue,
      fill: CATEGORY_COLORS[name] || '#6b7280'
    }));
  }, [bikeAnalytics]);

  // Location popularity
  const locationData = useMemo(() => {
    const locations: Record<string, number> = {};
    
    bookings.forEach(booking => {
      const loc = booking.pickup_location;
      locations[loc] = (locations[loc] || 0) + 1;
    });
    
    return Object.entries(locations)
      .map(([name, count]) => ({ name, bookings: count }))
      .sort((a, b) => b.bookings - a.bookings)
      .slice(0, 8);
  }, [bookings]);

  // Daily booking trend
  const dailyTrend = useMemo(() => {
    const days: Record<string, { date: string; bookings: number; revenue: number }> = {};
    const daysCount = Math.min(parseInt(timeRange), 14);
    
    for (let i = daysCount - 1; i >= 0; i--) {
      const date = format(subDays(new Date(), i), 'yyyy-MM-dd');
      days[date] = { date: format(subDays(new Date(), i), 'MMM d'), bookings: 0, revenue: 0 };
    }
    
    bookings.forEach(booking => {
      const date = format(parseISO(booking.created_at), 'yyyy-MM-dd');
      if (days[date]) {
        days[date].bookings += 1;
        days[date].revenue += booking.total_price || 0;
      }
    });
    
    return Object.values(days);
  }, [bookings, timeRange]);

  // Summary stats
  const stats = useMemo(() => {
    const totalRevenue = bikeAnalytics.reduce((sum, b) => sum + b.totalRevenue, 0);
    const totalBookings = bookings.length;
    const avgUtilization = bikeAnalytics.length > 0 
      ? bikeAnalytics.reduce((sum, b) => sum + b.utilizationRate, 0) / bikeAnalytics.length 
      : 0;
    const topBike = bikeAnalytics[0];
    
    return { totalRevenue, totalBookings, avgUtilization, topBike };
  }, [bikeAnalytics, bookings]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Time Range */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-display flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-primary" />
          Fleet Analytics
        </h2>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Last 7 days</SelectItem>
            <SelectItem value="14">Last 14 days</SelectItem>
            <SelectItem value="30">Last 30 days</SelectItem>
            <SelectItem value="60">Last 60 days</SelectItem>
            <SelectItem value="90">Last 90 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/20">
                  <DollarSign className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-xl font-bold">KES {(stats.totalRevenue / 1000).toFixed(1)}K</p>
                  <p className="text-xs text-muted-foreground">Total Revenue</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="bg-gradient-to-br from-accent/10 to-accent/5 border-accent/20">
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-accent/20">
                  <Calendar className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <p className="text-xl font-bold">{stats.totalBookings}</p>
                  <p className="text-xs text-muted-foreground">Total Bookings</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="bg-gradient-to-br from-success/10 to-success/5 border-success/20">
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-success/20">
                  <TrendingUp className="w-6 h-6 text-success" />
                </div>
                <div>
                  <p className="text-xl font-bold">{stats.avgUtilization.toFixed(0)}%</p>
                  <p className="text-xs text-muted-foreground">Avg Utilization</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card className="bg-gradient-to-br from-secondary to-secondary/80 border-border/20">
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/20">
                  <Bike className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-bold truncate">{stats.topBike?.name || 'N/A'}</p>
                  <p className="text-xs text-muted-foreground">Top Performer</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Charts Row */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Booking Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              Booking Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dailyTrend}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="date" className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                  <YAxis className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="bookings" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    dot={{ fill: 'hsl(var(--primary))' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Category Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <PieChart className="w-4 h-4 text-accent" />
              Bookings by Category
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPie>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="bookings"
                    label={({ name, bookings }) => `${name}: ${bookings}`}
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                    formatter={(value, name) => [value, name === 'bookings' ? 'Bookings' : 'Revenue']}
                  />
                </RechartsPie>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Location Popularity */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <MapPin className="w-4 h-4 text-primary" />
            Popular Pickup Locations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={locationData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis type="number" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  width={120} 
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} 
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Bar dataKey="bookings" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Bike Performance Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Bike className="w-4 h-4 text-primary" />
            Individual Bike Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Bike</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-center">Bookings</TableHead>
                  <TableHead className="text-right">Revenue</TableHead>
                  <TableHead className="text-center">Avg Duration</TableHead>
                  <TableHead>Utilization</TableHead>
                  <TableHead className="text-center">Rating</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bikeAnalytics.slice(0, 10).map((bike, index) => (
                  <TableRow key={bike.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {index < 3 && (
                          <Badge variant="outline" className="text-xs">
                            #{index + 1}
                          </Badge>
                        )}
                        {bike.name}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant="secondary" 
                        style={{ backgroundColor: CATEGORY_COLORS[bike.category] + '20', color: CATEGORY_COLORS[bike.category] }}
                      >
                        {bike.category}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">{bike.totalBookings}</TableCell>
                    <TableCell className="text-right font-medium">
                      KES {bike.totalRevenue.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-center">
                      {bike.avgDuration.toFixed(1)} days
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress value={bike.utilizationRate} className="h-2 w-20" />
                        <span className="text-xs text-muted-foreground">
                          {bike.utilizationRate.toFixed(0)}%
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      {bike.rating ? (
                        <div className="flex items-center justify-center gap-1">
                          <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                          <span>{bike.rating.toFixed(1)}</span>
                        </div>
                      ) : '-'}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant={bike.isAvailable ? 'default' : 'secondary'}>
                        {bike.isAvailable ? 'Available' : 'Rented'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
