import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { HardHat, Loader2 } from 'lucide-react';

interface GearItem {
  id: string;
  name: string;
  description: string | null;
  category: string;
  price_per_day: number;
  quantity_available: number;
}

interface SelectedGear {
  id: string;
  name: string;
  price_per_day: number;
  quantity: number;
}

interface GearSelectorProps {
  days: number;
  onGearChange: (gear: SelectedGear[], total: number) => void;
}

const categoryIcons: Record<string, string> = {
  helmet: '🪖',
  jacket: '🧥',
  gloves: '🧤',
  boots: '🥾',
  accessories: '🎒',
};

export default function GearSelector({ days, onGearChange }: GearSelectorProps) {
  const [gearItems, setGearItems] = useState<GearItem[]>([]);
  const [selectedGear, setSelectedGear] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchGear = async () => {
      try {
        const { data, error } = await supabase
          .from('gear_items')
          .select('*')
          .eq('active', true)
          .gt('quantity_available', 0);

        if (error) throw error;
        setGearItems(data || []);
      } catch (error) {
        console.error('Failed to fetch gear:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchGear();
  }, []);

  const handleGearToggle = (id: string) => {
    const newSelected = { ...selectedGear, [id]: !selectedGear[id] };
    setSelectedGear(newSelected);

    // Calculate selected gear items and total
    const items: SelectedGear[] = gearItems
      .filter(g => newSelected[g.id])
      .map(g => ({
        id: g.id,
        name: g.name,
        price_per_day: g.price_per_day,
        quantity: 1,
      }));

    const total = items.reduce((sum, item) => sum + (item.price_per_day * days), 0);
    onGearChange(items, total);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-4">
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (gearItems.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <HardHat className="w-4 h-4 text-primary" />
        <span className="text-sm font-medium">Add Safety Gear</span>
        <Badge variant="secondary" className="text-xs">Optional</Badge>
      </div>
      
      <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto pr-1">
        {gearItems.map(gear => (
          <label
            key={gear.id}
            className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-all ${
              selectedGear[gear.id] 
                ? 'border-primary bg-primary/5' 
                : 'border-border hover:border-primary/50'
            }`}
          >
            <Checkbox
              checked={selectedGear[gear.id] || false}
              onCheckedChange={() => handleGearToggle(gear.id)}
            />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium truncate">
                {categoryIcons[gear.category]} {gear.name}
              </p>
              <p className="text-xs text-primary">
                +KES {gear.price_per_day.toLocaleString()}/day
              </p>
            </div>
          </label>
        ))}
      </div>
    </div>
  );
}
