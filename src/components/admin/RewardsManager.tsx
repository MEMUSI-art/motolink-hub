import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { Gift, Plus, Loader2, Trash2, Edit2, X, Check } from 'lucide-react';
import { toast } from 'sonner';

interface Reward {
  id: string;
  name: string;
  description: string | null;
  points_required: number;
  reward_type: string;
  reward_value: number;
  min_tier: string;
  active: boolean | null;
}

export default function RewardsManager() {
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    points_required: 500,
    reward_type: 'discount_percent',
    reward_value: 10,
    min_tier: 'bronze',
  });

  useEffect(() => {
    fetchRewards();
  }, []);

  const fetchRewards = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('rewards')
        .select('*')
        .order('points_required');
      
      if (error) throw error;
      setRewards(data || []);
    } catch (error) {
      console.error('Failed to fetch rewards:', error);
      toast.error('Failed to load rewards');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingId) {
        const { error } = await supabase
          .from('rewards')
          .update(formData)
          .eq('id', editingId);
        
        if (error) throw error;
        toast.success('Reward updated!');
      } else {
        const { error } = await supabase
          .from('rewards')
          .insert(formData);
        
        if (error) throw error;
        toast.success('Reward created!');
      }
      
      resetForm();
      fetchRewards();
    } catch (error: any) {
      toast.error(error.message || 'Failed to save reward');
    }
  };

  const toggleActive = async (id: string, active: boolean) => {
    try {
      const { error } = await supabase
        .from('rewards')
        .update({ active: !active })
        .eq('id', id);
      
      if (error) throw error;
      setRewards(prev => prev.map(r => r.id === id ? { ...r, active: !active } : r));
      toast.success(`Reward ${!active ? 'activated' : 'deactivated'}`);
    } catch (error) {
      toast.error('Failed to update reward');
    }
  };

  const deleteReward = async (id: string) => {
    if (!confirm('Delete this reward?')) return;
    
    try {
      const { error } = await supabase
        .from('rewards')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      setRewards(prev => prev.filter(r => r.id !== id));
      toast.success('Reward deleted');
    } catch (error) {
      toast.error('Failed to delete reward');
    }
  };

  const editReward = (reward: Reward) => {
    setFormData({
      name: reward.name,
      description: reward.description || '',
      points_required: reward.points_required,
      reward_type: reward.reward_type,
      reward_value: reward.reward_value,
      min_tier: reward.min_tier,
    });
    setEditingId(reward.id);
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      points_required: 500,
      reward_type: 'discount_percent',
      reward_value: 10,
      min_tier: 'bronze',
    });
    setEditingId(null);
    setShowForm(false);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Gift className="w-5 h-5 text-primary" />
          Rewards Management
        </CardTitle>
        <Button onClick={() => setShowForm(!showForm)} size="sm">
          {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showForm ? 'Cancel' : 'Add Reward'}
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {showForm && (
          <form onSubmit={handleSubmit} className="p-4 bg-muted/50 rounded-lg space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input
                  value={formData.name}
                  onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="10% Off Next Rental"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Points Required</Label>
                <Input
                  type="number"
                  value={formData.points_required}
                  onChange={e => setFormData(prev => ({ ...prev, points_required: Number(e.target.value) }))}
                  min={100}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Reward Type</Label>
                <Select value={formData.reward_type} onValueChange={v => setFormData(prev => ({ ...prev, reward_type: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="discount_percent">Percentage Discount</SelectItem>
                    <SelectItem value="discount_fixed">Fixed Discount (KES)</SelectItem>
                    <SelectItem value="free_gear">Free Gear</SelectItem>
                    <SelectItem value="free_day">Free Day</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Value</Label>
                <Input
                  type="number"
                  value={formData.reward_value}
                  onChange={e => setFormData(prev => ({ ...prev, reward_value: Number(e.target.value) }))}
                  min={0}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Minimum Tier</Label>
                <Select value={formData.min_tier} onValueChange={v => setFormData(prev => ({ ...prev, min_tier: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bronze">Bronze</SelectItem>
                    <SelectItem value="silver">Silver</SelectItem>
                    <SelectItem value="gold">Gold</SelectItem>
                    <SelectItem value="platinum">Platinum</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Input
                  value={formData.description}
                  onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Optional description"
                />
              </div>
            </div>
            <Button type="submit">
              <Check className="w-4 h-4" />
              {editingId ? 'Update Reward' : 'Create Reward'}
            </Button>
          </form>
        )}

        <div className="space-y-3">
          {rewards.map(reward => (
            <div
              key={reward.id}
              className="flex items-center justify-between p-4 bg-muted/30 rounded-lg"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-semibold">{reward.name}</h4>
                  <Badge variant="secondary">{reward.points_required} pts</Badge>
                  <Badge variant="outline" className="capitalize">{reward.min_tier}+</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {reward.reward_type.replace('_', ' ')} • Value: {reward.reward_value}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Switch
                  checked={reward.active ?? true}
                  onCheckedChange={() => toggleActive(reward.id, reward.active ?? true)}
                />
                <Button size="icon" variant="ghost" onClick={() => editReward(reward)}>
                  <Edit2 className="w-4 h-4" />
                </Button>
                <Button size="icon" variant="ghost" onClick={() => deleteReward(reward.id)}>
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}