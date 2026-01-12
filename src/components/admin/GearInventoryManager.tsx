import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { HardHat, Plus, Trash2, Loader2, Edit, Package } from 'lucide-react';
import { toast } from 'sonner';

interface GearItem {
  id: string;
  name: string;
  description: string | null;
  category: string;
  price_per_day: number;
  quantity_available: number;
  active: boolean;
}

const categories = [
  { value: 'helmet', label: '🪖 Helmet' },
  { value: 'jacket', label: '🧥 Jacket' },
  { value: 'gloves', label: '🧤 Gloves' },
  { value: 'boots', label: '🥾 Boots' },
  { value: 'accessories', label: '🎒 Accessories' },
];

export default function GearInventoryManager() {
  const [gearItems, setGearItems] = useState<GearItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<GearItem | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'helmet',
    price_per_day: 200,
    quantity_available: 5,
    active: true,
  });

  const fetchGearItems = async () => {
    try {
      const { data, error } = await supabase
        .from('gear_items')
        .select('*')
        .order('category', { ascending: true });

      if (error) throw error;
      setGearItems(data || []);
    } catch (error) {
      console.error('Failed to fetch gear items:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGearItems();
  }, []);

  const openAddModal = () => {
    setEditingItem(null);
    setFormData({
      name: '',
      description: '',
      category: 'helmet',
      price_per_day: 200,
      quantity_available: 5,
      active: true,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (item: GearItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      description: item.description || '',
      category: item.category,
      price_per_day: item.price_per_day,
      quantity_available: item.quantity_available,
      active: item.active,
    });
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name || formData.price_per_day <= 0) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSaving(true);
    try {
      if (editingItem) {
        const { error } = await supabase
          .from('gear_items')
          .update({
            name: formData.name,
            description: formData.description || null,
            category: formData.category,
            price_per_day: formData.price_per_day,
            quantity_available: formData.quantity_available,
            active: formData.active,
          })
          .eq('id', editingItem.id);

        if (error) throw error;
        toast.success('Gear item updated');
      } else {
        const { error } = await supabase
          .from('gear_items')
          .insert({
            name: formData.name,
            description: formData.description || null,
            category: formData.category,
            price_per_day: formData.price_per_day,
            quantity_available: formData.quantity_available,
            active: formData.active,
          });

        if (error) throw error;
        toast.success('Gear item added');
      }

      setIsModalOpen(false);
      fetchGearItems();
    } catch (error) {
      console.error('Failed to save gear item:', error);
      toast.error('Failed to save gear item');
    } finally {
      setIsSaving(false);
    }
  };

  const deleteItem = async (id: string) => {
    try {
      const { error } = await supabase
        .from('gear_items')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setGearItems(prev => prev.filter(g => g.id !== id));
      toast.success('Gear item deleted');
    } catch (error) {
      toast.error('Failed to delete gear item');
    }
  };

  const getCategoryLabel = (category: string) => {
    return categories.find(c => c.value === category)?.label || category;
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <HardHat className="w-5 h-5 text-primary" />
            Gear Inventory
          </CardTitle>
          <Button size="sm" onClick={openAddModal}>
            <Plus className="w-4 h-4" />
            Add Gear
          </Button>
        </CardHeader>
        <CardContent>
          {gearItems.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              <Package className="w-10 h-10 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No gear items yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {gearItems.map(item => (
                <div 
                  key={item.id} 
                  className={`flex items-center justify-between p-3 rounded-lg border ${
                    item.active ? 'bg-card' : 'bg-muted/50 opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{getCategoryLabel(item.category).split(' ')[0]}</span>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{item.name}</p>
                        {!item.active && <Badge variant="secondary">Inactive</Badge>}
                      </div>
                      <p className="text-sm text-primary">KES {item.price_per_day.toLocaleString()}/day</p>
                      <p className="text-xs text-muted-foreground">
                        Stock: {item.quantity_available} available
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={() => openEditModal(item)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="text-destructive hover:text-destructive"
                      onClick={() => deleteItem(item.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingItem ? 'Edit Gear Item' : 'Add Gear Item'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Name *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Premium Helmet"
              />
            </div>
            <div>
              <Label>Description</Label>
              <Input
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="DOT-certified full-face helmet"
              />
            </div>
            <div>
              <Label>Category</Label>
              <Select 
                value={formData.category} 
                onValueChange={(v) => setFormData({ ...formData, category: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(cat => (
                    <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Price/Day (KES) *</Label>
                <Input
                  type="number"
                  value={formData.price_per_day}
                  onChange={(e) => setFormData({ ...formData, price_per_day: Number(e.target.value) })}
                  min={0}
                />
              </div>
              <div>
                <Label>Quantity Available</Label>
                <Input
                  type="number"
                  value={formData.quantity_available}
                  onChange={(e) => setFormData({ ...formData, quantity_available: Number(e.target.value) })}
                  min={0}
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={formData.active}
                onCheckedChange={(checked) => setFormData({ ...formData, active: checked })}
              />
              <Label>Active (available for rental)</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
