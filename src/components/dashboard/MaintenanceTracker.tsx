import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { Clock, CheckCircle2, Wrench, Package, Search, TestTube, Car, Calendar, User, DollarSign, Image } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const stages = [
  { id: 'received', label: 'Received', icon: Package, color: 'bg-muted' },
  { id: 'diagnosing', label: 'Diagnosing', icon: Search, color: 'bg-accent' },
  { id: 'parts_ordered', label: 'Parts Ordered', icon: Package, color: 'bg-warning' },
  { id: 'repairing', label: 'Repairing', icon: Wrench, color: 'bg-primary' },
  { id: 'testing', label: 'Testing', icon: TestTube, color: 'bg-success/80' },
  { id: 'ready', label: 'Ready', icon: Car, color: 'bg-success' },
  { id: 'completed', label: 'Completed', icon: CheckCircle2, color: 'bg-success' },
];

export default function MaintenanceTracker() {
  const { user } = useAuth();

  const { data: services, isLoading } = useQuery({
    queryKey: ['user-services', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const { data: progressHistory } = useQuery({
    queryKey: ['maintenance-progress', user?.id],
    queryFn: async () => {
      if (!services) return {};
      const serviceIds = services.map(s => s.id);
      const { data, error } = await supabase
        .from('maintenance_progress')
        .select('*')
        .in('service_id', serviceIds)
        .order('created_at', { ascending: true });
      if (error) throw error;
      
      // Group by service_id
      const grouped: Record<string, any[]> = {};
      data?.forEach(item => {
        if (!grouped[item.service_id]) grouped[item.service_id] = [];
        grouped[item.service_id].push(item);
      });
      return grouped;
    },
    enabled: !!services && services.length > 0,
  });

  const getStageIndex = (stage: string) => stages.findIndex(s => s.id === stage);
  
  const getProgressPercentage = (stage: string) => {
    const index = getStageIndex(stage);
    return ((index + 1) / stages.length) * 100;
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      maximumFractionDigits: 0,
    }).format(price);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(2)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6 space-y-4">
              <div className="h-6 bg-muted rounded w-1/3" />
              <div className="h-4 bg-muted rounded" />
              <div className="h-20 bg-muted rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!services || services.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Wrench className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="font-display text-xl mb-2">No Service Requests</h3>
          <p className="text-muted-foreground">
            Book a mechanic service to track your maintenance progress here.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="font-display text-2xl text-foreground">Maintenance Progress</h2>

      <Accordion type="single" collapsible className="space-y-4">
        {services.map((service) => {
          const currentStage = (service as any).progress_stage || 'received';
          const stageIndex = getStageIndex(currentStage);
          const history = progressHistory?.[service.id] || [];
          const costBreakdown = (service as any).cost_breakdown || [];
          const techNotes = (service as any).technician_notes || [];

          return (
            <AccordionItem key={service.id} value={service.id} className="border rounded-xl overflow-hidden">
              <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-muted/50">
                <div className="flex flex-col md:flex-row md:items-center gap-4 text-left w-full pr-4">
                  <div className="flex-1">
                    <h3 className="font-display text-lg text-card-foreground">{service.bike}</h3>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(service.created_at), 'MMM d, yyyy')}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Badge 
                      className={`${stages[stageIndex]?.color || 'bg-muted'} text-white`}
                    >
                      {stages[stageIndex]?.label || currentStage}
                    </Badge>
                    <div className="w-32 hidden md:block">
                      <Progress value={getProgressPercentage(currentStage)} className="h-2" />
                    </div>
                  </div>
                </div>
              </AccordionTrigger>

              <AccordionContent className="px-6 pb-6">
                {/* Progress Timeline */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    {stages.map((stage, index) => {
                      const isActive = index <= stageIndex;
                      const isCurrent = index === stageIndex;
                      const StageIcon = stage.icon;

                      return (
                        <div key={stage.id} className="flex flex-col items-center flex-1">
                          <div className={`
                            w-10 h-10 rounded-full flex items-center justify-center transition-all
                            ${isActive ? stage.color : 'bg-muted'}
                            ${isCurrent ? 'ring-2 ring-offset-2 ring-primary' : ''}
                          `}>
                            <StageIcon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-muted-foreground'}`} />
                          </div>
                          <span className={`text-xs mt-2 text-center hidden md:block ${isActive ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                            {stage.label}
                          </span>
                          {index < stages.length - 1 && (
                            <div className={`absolute w-full h-0.5 top-5 left-1/2 ${isActive && index < stageIndex ? stage.color : 'bg-muted'}`} />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  {/* Service Details */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium">Service Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Technician:</span>
                        <span className="font-medium">{(service as any).assigned_technician || 'Not assigned'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Est. Completion:</span>
                        <span className="font-medium">
                          {(service as any).estimated_completion 
                            ? format(new Date((service as any).estimated_completion), 'MMM d, yyyy')
                            : 'TBD'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Total Cost:</span>
                        <span className="font-medium text-primary">{formatPrice(service.total_price)}</span>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Cost Breakdown */}
                  {costBreakdown.length > 0 && (
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium">Cost Breakdown</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2 text-sm">
                          {costBreakdown.map((item: any, i: number) => (
                            <li key={i} className="flex justify-between">
                              <span className="text-muted-foreground">{item.description}</span>
                              <span className="font-medium">{formatPrice(item.amount)}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  )}
                </div>

                {/* Progress History */}
                {history.length > 0 && (
                  <Card className="mt-6">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium">Progress Updates</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {history.map((entry: any, i: number) => (
                          <div key={i} className="flex gap-4 pb-4 border-b border-border last:border-0 last:pb-0">
                            <div className="w-2 h-2 mt-2 rounded-full bg-primary flex-shrink-0" />
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <Badge variant="secondary" className="text-xs">
                                  {stages.find(s => s.id === entry.stage)?.label || entry.stage}
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                  {format(new Date(entry.created_at), 'MMM d, h:mm a')}
                                </span>
                              </div>
                              {entry.note && <p className="text-sm text-foreground">{entry.note}</p>}
                              {entry.photo_url && (
                                <img 
                                  src={entry.photo_url} 
                                  alt="Progress photo" 
                                  className="mt-2 rounded-lg max-w-xs"
                                />
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Technician Notes */}
                {techNotes.length > 0 && (
                  <Card className="mt-6">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium">Technician Notes</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-3">
                        {techNotes.map((note: any, i: number) => (
                          <li key={i} className="p-3 bg-muted rounded-lg">
                            <p className="text-sm text-foreground">{note.text}</p>
                            <span className="text-xs text-muted-foreground mt-1 block">
                              {note.date ? format(new Date(note.date), 'MMM d, yyyy') : ''}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
    </div>
  );
}