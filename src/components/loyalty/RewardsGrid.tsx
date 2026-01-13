import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Gift, Loader2, Lock, Check, Percent, Tag, Calendar, HardHat } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

interface Reward {
  id: string;
  name: string;
  description: string | null;
  points_required: number;
  reward_type: string;
  reward_value: number;
  min_tier: string;
}

interface LoyaltyData {
  total_points: number;
  tier: string;
}

const TIER_ORDER = ['bronze', 'silver', 'gold', 'platinum'];

const REWARD_ICONS = {
  discount_percent: Percent,
  discount_fixed: Tag,
  free_gear: HardHat,
  free_day: Calendar,
};

export default function RewardsGrid() {
  const { user } = useAuth();
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [loyaltyData, setLoyaltyData] = useState<LoyaltyData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [redeemingId, setRedeemingId] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [rewardsRes, loyaltyRes] = await Promise.all([
        supabase.from('rewards').select('*').eq('active', true).order('points_required'),
        user ? supabase.from('loyalty_points').select('*').eq('user_id', user.id).maybeSingle() : null,
      ]);

      if (rewardsRes.data) setRewards(rewardsRes.data);
      if (loyaltyRes?.data) setLoyaltyData(loyaltyRes.data);
    } catch (error) {
      console.error('Failed to fetch rewards:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const canRedeem = (reward: Reward) => {
    if (!loyaltyData) return false;
    const userTierIndex = TIER_ORDER.indexOf(loyaltyData.tier);
    const requiredTierIndex = TIER_ORDER.indexOf(reward.min_tier);
    return loyaltyData.total_points >= reward.points_required && userTierIndex >= requiredTierIndex;
  };

  const isTierLocked = (reward: Reward) => {
    if (!loyaltyData) return true;
    const userTierIndex = TIER_ORDER.indexOf(loyaltyData.tier);
    const requiredTierIndex = TIER_ORDER.indexOf(reward.min_tier);
    return userTierIndex < requiredTierIndex;
  };

  const generateRewardCode = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = 'MTL-';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  };

  const handleRedeem = async (reward: Reward) => {
    if (!user || !loyaltyData) return;
    
    setRedeemingId(reward.id);
    try {
      // Generate unique reward code
      const rewardCode = generateRewardCode();
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30); // 30 days expiry

      // Create user reward
      const { error: rewardError } = await supabase
        .from('user_rewards')
        .insert({
          user_id: user.id,
          reward_id: reward.id,
          reward_code: rewardCode,
          expires_at: expiresAt.toISOString(),
        });

      if (rewardError) throw rewardError;

      // Deduct points
      const newPoints = loyaltyData.total_points - reward.points_required;
      const { error: pointsError } = await supabase
        .from('loyalty_points')
        .update({ total_points: newPoints })
        .eq('user_id', user.id);

      if (pointsError) throw pointsError;

      // Record transaction
      await supabase.from('points_transactions').insert({
        user_id: user.id,
        points: -reward.points_required,
        transaction_type: 'redeemed',
        description: `Redeemed: ${reward.name}`,
        reference_id: reward.id,
        reference_type: 'reward',
      });

      toast.success(`Reward redeemed! Your code: ${rewardCode}`, {
        duration: 10000,
      });

      // Refresh data
      fetchData();
    } catch (error: any) {
      console.error('Failed to redeem:', error);
      toast.error(error.message || 'Failed to redeem reward');
    } finally {
      setRedeemingId(null);
    }
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
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Gift className="w-5 h-5 text-primary" />
          Available Rewards
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {rewards.map((reward, index) => {
            const Icon = REWARD_ICONS[reward.reward_type as keyof typeof REWARD_ICONS] || Gift;
            const locked = isTierLocked(reward);
            const affordable = canRedeem(reward);
            
            return (
              <motion.div
                key={reward.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className={`relative overflow-hidden transition-all ${locked ? 'opacity-60' : affordable ? 'border-primary/30 hover:border-primary/60' : ''}`}>
                  {locked && (
                    <div className="absolute inset-0 bg-background/50 backdrop-blur-[1px] z-10 flex items-center justify-center">
                      <div className="text-center">
                        <Lock className="w-6 h-6 mx-auto mb-1 text-muted-foreground" />
                        <p className="text-sm font-medium capitalize">{reward.min_tier}+ only</p>
                      </div>
                    </div>
                  )}
                  <CardContent className="pt-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Icon className="w-5 h-5 text-primary" />
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {reward.points_required.toLocaleString()} pts
                      </Badge>
                    </div>
                    <div>
                      <h4 className="font-semibold">{reward.name}</h4>
                      <p className="text-sm text-muted-foreground">{reward.description}</p>
                    </div>
                    <Button 
                      className="w-full" 
                      size="sm"
                      disabled={!affordable || redeemingId === reward.id}
                      onClick={() => handleRedeem(reward)}
                    >
                      {redeemingId === reward.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : affordable ? (
                        <>
                          <Check className="w-4 h-4" />
                          Redeem
                        </>
                      ) : (
                        `Need ${(reward.points_required - (loyaltyData?.total_points || 0)).toLocaleString()} more pts`
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}