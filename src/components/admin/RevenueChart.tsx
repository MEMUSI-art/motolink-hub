import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { format, subDays, startOfDay, parseISO } from 'date-fns';

interface BookingRow {
  id: string;
  status: string;
  total_price: number;
  created_at: string;
}

interface ServiceRow {
  id: string;
  status: string;
  total_price: number;
  created_at: string;
}

interface RevenueChartProps {
  bookings: BookingRow[];
  services: ServiceRow[];
}

const COLORS = ['hsl(var(--primary))', 'hsl(var(--accent))', 'hsl(var(--success))', 'hsl(var(--destructive))'];

export default function RevenueChart({ bookings, services }: RevenueChartProps) {
  // Calculate last 14 days revenue data
  const revenueData = useMemo(() => {
    const days = 14;
    const data = [];
    
    for (let i = days - 1; i >= 0; i--) {
      const date = startOfDay(subDays(new Date(), i));
      const dateStr = format(date, 'yyyy-MM-dd');
      const displayDate = format(date, 'MMM d');
      
      const dayBookings = bookings.filter(b => {
        const bookingDate = format(parseISO(b.created_at), 'yyyy-MM-dd');
        return bookingDate === dateStr && b.status !== 'cancelled';
      });
      
      const dayServices = services.filter(s => {
        const serviceDate = format(parseISO(s.created_at), 'yyyy-MM-dd');
        return serviceDate === dateStr && s.status !== 'cancelled';
      });
      
      data.push({
        date: displayDate,
        bookings: dayBookings.reduce((sum, b) => sum + (b.total_price || 0), 0),
        services: dayServices.reduce((sum, s) => sum + (s.total_price || 0), 0),
        total: dayBookings.reduce((sum, b) => sum + (b.total_price || 0), 0) + 
               dayServices.reduce((sum, s) => sum + (s.total_price || 0), 0),
      });
    }
    
    return data;
  }, [bookings, services]);

  // Status distribution for pie chart
  const statusDistribution = useMemo(() => {
    const statuses = ['pending', 'confirmed', 'completed', 'cancelled'];
    return statuses.map(status => ({
      name: status.charAt(0).toUpperCase() + status.slice(1),
      value: bookings.filter(b => b.status === status).length,
    })).filter(s => s.value > 0);
  }, [bookings]);

  // Weekly comparison
  const weeklyComparison = useMemo(() => {
    const thisWeek = bookings.filter(b => {
      const bookingDate = parseISO(b.created_at);
      return bookingDate >= subDays(new Date(), 7) && b.status !== 'cancelled';
    }).reduce((sum, b) => sum + (b.total_price || 0), 0);

    const lastWeek = bookings.filter(b => {
      const bookingDate = parseISO(b.created_at);
      return bookingDate >= subDays(new Date(), 14) && 
             bookingDate < subDays(new Date(), 7) && 
             b.status !== 'cancelled';
    }).reduce((sum, b) => sum + (b.total_price || 0), 0);

    const change = lastWeek > 0 ? ((thisWeek - lastWeek) / lastWeek * 100).toFixed(1) : 0;
    
    return { thisWeek, lastWeek, change };
  }, [bookings]);

  return (
    <div className="space-y-6">
      {/* Revenue Trend Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Revenue Trend (Last 14 Days)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="colorBookings" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorServices" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--accent))" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(var(--accent))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="date" className="text-xs" />
                <YAxis 
                  className="text-xs" 
                  tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                  formatter={(value: number) => [`KES ${value.toLocaleString()}`, '']}
                />
                <Area 
                  type="monotone" 
                  dataKey="bookings" 
                  stroke="hsl(var(--primary))" 
                  fillOpacity={1} 
                  fill="url(#colorBookings)"
                  name="Bike Rentals"
                />
                <Area 
                  type="monotone" 
                  dataKey="services" 
                  stroke="hsl(var(--accent))" 
                  fillOpacity={1} 
                  fill="url(#colorServices)"
                  name="Services"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Stats Row */}
      <div className="grid md:grid-cols-3 gap-4">
        {/* Weekly Comparison */}
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground mb-1">This Week</p>
            <p className="text-2xl font-bold">KES {weeklyComparison.thisWeek.toLocaleString()}</p>
            <p className={`text-sm mt-1 ${Number(weeklyComparison.change) >= 0 ? 'text-success' : 'text-destructive'}`}>
              {Number(weeklyComparison.change) >= 0 ? '↑' : '↓'} {Math.abs(Number(weeklyComparison.change))}% vs last week
            </p>
          </CardContent>
        </Card>

        {/* Booking Status Pie */}
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground mb-2">Booking Status</p>
            <div className="h-[120px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={30}
                    outerRadius={50}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {statusDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap gap-2 justify-center">
              {statusDistribution.map((entry, index) => (
                <div key={entry.name} className="flex items-center gap-1 text-xs">
                  <div 
                    className="w-2 h-2 rounded-full" 
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  {entry.name}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Daily Average */}
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground mb-1">Daily Average</p>
            <p className="text-2xl font-bold">
              KES {Math.round(revenueData.reduce((sum, d) => sum + d.total, 0) / 14).toLocaleString()}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {bookings.filter(b => b.status !== 'cancelled').length} total bookings
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
