import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Ticket, Loader2, Copy, Check, Clock } from 'lucide-react';
import { format, isPast } from 'date-fns';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

interface UserReward {
  id: string;
  reward_code: string;
  status: string;
  expires_at: string | null;
  created_at: string;
  rewards: {
    name: string;
    description: string | null;
    reward_type: string;
    reward_value: number;
  } | null;
}

export default function MyRewards() {
  const { user } = useAuth();
  const [userRewards, setUserRewards] = useState<UserReward[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    
    const fetchUserRewards = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('user_rewards')
          .select(`
            *,
            rewards (name, description, reward_type, reward_value)
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        setUserRewards(data || []);
      } catch (error) {
        console.error('Failed to fetch user rewards:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserRewards();
  }, [user]);

  const copyCode = async (code: string) => {
    await navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success('Code copied to clipboard!');
    setTimeout(() => setCopiedCode(null), 2000);
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

  const availableRewards = userRewards.filter(r => r.status === 'available' && (!r.expires_at || !isPast(new Date(r.expires_at))));
  const usedRewards = userRewards.filter(r => r.status === 'used' || (r.expires_at && isPast(new Date(r.expires_at))));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Ticket className="w-5 h-5 text-primary" />
          My Rewards ({availableRewards.length} available)
        </CardTitle>
      </CardHeader>
      <CardContent>
        {userRewards.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Ticket className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No rewards redeemed yet</p>
            <p className="text-sm">Redeem your points for awesome rewards!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {availableRewards.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-muted-foreground">Available</h4>
                {availableRewards.map((reward, index) => (
                  <motion.div
                    key={reward.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="p-4 bg-gradient-to-r from-primary/5 to-accent/5 rounded-lg border border-primary/20"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h5 className="font-semibold">{reward.rewards?.name}</h5>
                        <p className="text-sm text-muted-foreground">{reward.rewards?.description}</p>
                      </div>
                      <Badge variant="default">Active</Badge>
                    </div>
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/50">
                      <div className="flex items-center gap-2">
                        <code className="bg-background px-3 py-1 rounded font-mono text-sm">
                          {reward.reward_code}
                        </code>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8"
                          onClick={() => copyCode(reward.reward_code)}
                        >
                          {copiedCode === reward.reward_code ? (
                            <Check className="w-4 h-4 text-success" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                      {reward.expires_at && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          Expires {format(new Date(reward.expires_at), 'MMM d, yyyy')}
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {usedRewards.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-muted-foreground">Used/Expired</h4>
                {usedRewards.slice(0, 5).map((reward) => (
                  <div
                    key={reward.id}
                    className="p-3 bg-muted/30 rounded-lg opacity-60"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm">{reward.rewards?.name}</span>
                      <Badge variant="secondary">{reward.status}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}