import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { History, Loader2, TrendingUp, TrendingDown, Gift, Sparkles } from 'lucide-react';
import { format } from 'date-fns';
import { motion } from 'framer-motion';

interface Transaction {
  id: string;
  points: number;
  transaction_type: string;
  description: string | null;
  created_at: string;
}

const TYPE_CONFIG = {
  earned: { icon: TrendingUp, color: 'text-success', bg: 'bg-success/10', label: 'Earned' },
  redeemed: { icon: Gift, color: 'text-primary', bg: 'bg-primary/10', label: 'Redeemed' },
  expired: { icon: TrendingDown, color: 'text-destructive', bg: 'bg-destructive/10', label: 'Expired' },
  bonus: { icon: Sparkles, color: 'text-accent', bg: 'bg-accent/10', label: 'Bonus' },
};

export default function PointsHistory() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    
    const fetchTransactions = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('points_transactions')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(20);
        
        if (error) throw error;
        setTransactions(data || []);
      } catch (error) {
        console.error('Failed to fetch transactions:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTransactions();
  }, [user]);

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
          <History className="w-5 h-5 text-primary" />
          Points History
        </CardTitle>
      </CardHeader>
      <CardContent>
        {transactions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <History className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No points activity yet</p>
            <p className="text-sm">Complete a booking to earn points!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {transactions.map((tx, index) => {
              const config = TYPE_CONFIG[tx.transaction_type as keyof typeof TYPE_CONFIG] || TYPE_CONFIG.earned;
              const Icon = config.icon;
              
              return (
                <motion.div
                  key={tx.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${config.bg}`}>
                      <Icon className={`w-4 h-4 ${config.color}`} />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{tx.description || config.label}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(tx.created_at), 'MMM d, yyyy • h:mm a')}
                      </p>
                    </div>
                  </div>
                  <Badge variant={tx.points >= 0 ? 'default' : 'secondary'} className="font-mono">
                    {tx.points >= 0 ? '+' : ''}{tx.points}
                  </Badge>
                </motion.div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}