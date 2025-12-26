import { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CalendarDays } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BikeAvailabilityCalendarProps {
  bikeName: string;
  bookedDates?: Date[];
}

// Mock booked dates - will be replaced with PocketBase data
const mockBookedDates = [
  new Date(2025, 0, 5),
  new Date(2025, 0, 6),
  new Date(2025, 0, 7),
  new Date(2025, 0, 15),
  new Date(2025, 0, 16),
  new Date(2025, 0, 17),
  new Date(2025, 0, 18),
  new Date(2025, 0, 25),
  new Date(2025, 0, 26),
];

export default function BikeAvailabilityCalendar({ 
  bikeName,
  bookedDates = mockBookedDates 
}: BikeAvailabilityCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);

  const isDateBooked = (date: Date) => {
    return bookedDates.some(
      bookedDate => 
        bookedDate.getDate() === date.getDate() &&
        bookedDate.getMonth() === date.getMonth() &&
        bookedDate.getFullYear() === date.getFullYear()
    );
  };

  const modifiers = {
    booked: (date: Date) => isDateBooked(date),
  };

  const modifiersStyles = {
    booked: {
      backgroundColor: 'hsl(var(--destructive))',
      color: 'hsl(var(--destructive-foreground))',
      borderRadius: '0.375rem',
    },
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <CalendarDays className="w-5 h-5 text-primary" />
          Availability Calendar
        </CardTitle>
        <p className="text-sm text-muted-foreground">{bikeName}</p>
      </CardHeader>
      <CardContent>
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={setSelectedDate}
          modifiers={modifiers}
          modifiersStyles={modifiersStyles}
          disabled={(date) => date < new Date() || isDateBooked(date)}
          className={cn("rounded-md border pointer-events-auto")}
        />
        
        {/* Legend */}
        <div className="flex items-center gap-4 mt-4 pt-4 border-t">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-primary" />
            <span className="text-sm text-muted-foreground">Available</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-destructive" />
            <span className="text-sm text-muted-foreground">Booked</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-muted" />
            <span className="text-sm text-muted-foreground">Past</span>
          </div>
        </div>

        {selectedDate && !isDateBooked(selectedDate) && (
          <div className="mt-4 p-3 rounded-lg bg-success/10 border border-success/20">
            <Badge className="bg-success text-success-foreground">Available</Badge>
            <p className="text-sm mt-2">
              {bikeName} is available on {selectedDate.toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
