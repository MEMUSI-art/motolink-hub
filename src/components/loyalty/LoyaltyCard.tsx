import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Crown, Star, Trophy, Medal, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface LoyaltyData {
  total_points: number;
  lifetime_points: number;
  tier: string;
}

const TIER_CONFIG = {
  bronze: { icon: Medal, color: 'text-amber-600', bg: 'bg-amber-600/10', next: 'silver', threshold: 0, nextThreshold: 2500 },
  silver: { icon: Star, color: 'text-slate-400', bg: 'bg-slate-400/10', next: 'gold', threshold: 2500, nextThreshold: 7500 },
  gold: { icon: Trophy, color: 'text-yellow-500', bg: 'bg-yellow-500/10', next: 'platinum', threshold: 7500, nextThreshold: 15000 },
  platinum: { icon: Crown, color: 'text-purple-400', bg: 'bg-purple-400/10', next: null, threshold: 15000, nextThreshold: 15000 },
};

export default function LoyaltyCard() {
  const { user } = useAuth();
  const [loyaltyData, setLoyaltyData] = useState<LoyaltyData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    
    const fetchLoyaltyData = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('loyalty_points')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();
        
        if (error) throw error;
        
        if (data) {
          setLoyaltyData(data);
        } else {
          // Create initial loyalty record
          const { data: newData, error: insertError } = await supabase
            .from('loyalty_points')
            .insert({ user_id: user.id })
            .select()
            .single();
          
          if (!insertError && newData) {
            setLoyaltyData(newData);
          }
        }
      } catch (error) {
        console.error('Failed to fetch loyalty data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLoyaltyData();
  }, [user]);

  if (isLoading) {
    return (
      <Card className="bg-gradient-to-br from-primary/10 to-accent/10">
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  const tier = (loyaltyData?.tier || 'bronze') as keyof typeof TIER_CONFIG;
  const config = TIER_CONFIG[tier];
  const TierIcon = config.icon;
  const points = loyaltyData?.total_points || 0;
  const lifetime = loyaltyData?.lifetime_points || 0;
  
  const progressToNext = config.next 
    ? Math.min(100, ((lifetime - config.threshold) / (config.nextThreshold - config.threshold)) * 100)
    : 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card className="bg-gradient-to-br from-secondary to-secondary/80 border-primary/20 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">MotoLink Rewards</CardTitle>
            <Badge className={`${config.bg} ${config.color} border-0 gap-1`}>
              <TierIcon className="w-3 h-3" />
              {tier.charAt(0).toUpperCase() + tier.slice(1)}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-end gap-2">
            <span className="text-4xl font-bold text-primary">{points.toLocaleString()}</span>
            <span className="text-muted-foreground pb-1">points available</span>
          </div>
          
          {config.next && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Progress to {config.next}</span>
                <span className="font-medium">{config.nextThreshold - lifetime} pts to go</span>
              </div>
              <Progress value={progressToNext} className="h-2" />
            </div>
          )}
          
          <div className="flex justify-between pt-2 border-t border-border/50 text-sm">
            <span className="text-muted-foreground">Lifetime Points</span>
            <span className="font-medium">{lifetime.toLocaleString()}</span>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}