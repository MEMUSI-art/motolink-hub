import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Wrench, Plus, Calendar as CalendarIcon, Clock, CheckCircle, 
  AlertTriangle, Loader2, Trash2, Edit, AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { format, isToday, isTomorrow, isPast, addDays } from 'date-fns';
import { cn } from '@/lib/utils';

interface MaintenanceRecord {
  id: string;
  bike_id: string | null;
  bike_name: string;
  maintenance_type: string;
  description: string | null;
  scheduled_date: string;
  completed_date: string | null;
  status: string;
  priority: string;
  cost: number | null;
  notes: string | null;
  technician: string | null;
  mileage: number | null;
  next_service_mileage: number | null;
  created_at: string;
  updated_at: string;
}

interface BikeOption {
  id: string;
  name: string;
}

const MAINTENANCE_TYPES = [
  'Oil Change',
  'Brake Inspection',
  'Tire Replacement',
  'Full Service',
  'Chain & Sprocket',
  'Battery Check',
  'Electrical Check',
  'Suspension Service',
  'Engine Tune-up',
  'Other'
];

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'high': return 'bg-destructive text-destructive-foreground';
    case 'urgent': return 'bg-destructive text-destructive-foreground animate-pulse';
    case 'normal': return 'bg-primary text-primary-foreground';
    case 'low': return 'bg-muted text-muted-foreground';
    default: return 'bg-secondary text-secondary-foreground';
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'completed': return 'bg-success text-success-foreground';
    case 'in_progress': return 'bg-accent text-accent-foreground';
    case 'scheduled': return 'bg-primary text-primary-foreground';
    case 'overdue': return 'bg-destructive text-destructive-foreground';
    case 'cancelled': return 'bg-muted text-muted-foreground';
    default: return 'bg-secondary text-secondary-foreground';
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'completed': return <CheckCircle className="w-4 h-4" />;
    case 'in_progress': return <Wrench className="w-4 h-4" />;
    case 'scheduled': return <Clock className="w-4 h-4" />;
    case 'overdue': return <AlertTriangle className="w-4 h-4" />;
    default: return <Clock className="w-4 h-4" />;
  }
};

export default function FleetMaintenanceScheduler() {
  const [records, setRecords] = useState<MaintenanceRecord[]>([]);
  const [bikes, setBikes] = useState<BikeOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<MaintenanceRecord | null>(null);
  const [activeTab, setActiveTab] = useState('upcoming');
  
  // Form state
  const [formData, setFormData] = useState({
    bike_id: '',
    bike_name: '',
    maintenance_type: '',
    description: '',
    scheduled_date: new Date(),
    priority: 'normal',
    cost: '',
    technician: '',
    mileage: '',
    next_service_mileage: '',
    notes: ''
  });

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [maintenanceRes, bikesRes] = await Promise.all([
        supabase.from('fleet_maintenance').select('*').order('scheduled_date', { ascending: true }),
        supabase.from('bikes').select('id, name')
      ]);

      if (maintenanceRes.data) {
        // Update status for overdue items
        const updatedRecords = maintenanceRes.data.map(record => {
          if (record.status === 'scheduled' && isPast(new Date(record.scheduled_date)) && !isToday(new Date(record.scheduled_date))) {
            return { ...record, status: 'overdue' };
          }
          return record;
        });
        setRecords(updatedRecords);
      }
      if (bikesRes.data) setBikes(bikesRes.data);
    } catch (error) {
      console.error('Error fetching maintenance data:', error);
      toast.error('Failed to load maintenance records');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    // Subscribe to realtime updates
    const channel = supabase
      .channel('fleet-maintenance')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'fleet_maintenance' }, () => {
        fetchData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const resetForm = () => {
    setFormData({
      bike_id: '',
      bike_name: '',
      maintenance_type: '',
      description: '',
      scheduled_date: new Date(),
      priority: 'normal',
      cost: '',
      technician: '',
      mileage: '',
      next_service_mileage: '',
      notes: ''
    });
    setEditingRecord(null);
  };

  const handleBikeSelect = (bikeId: string) => {
    const bike = bikes.find(b => b.id === bikeId);
    setFormData(prev => ({
      ...prev,
      bike_id: bikeId,
      bike_name: bike?.name || ''
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.bike_name || !formData.maintenance_type || !formData.scheduled_date) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const payload = {
        bike_id: formData.bike_id || null,
        bike_name: formData.bike_name,
        maintenance_type: formData.maintenance_type,
        description: formData.description || null,
        scheduled_date: format(formData.scheduled_date, 'yyyy-MM-dd'),
        priority: formData.priority,
        cost: formData.cost ? parseFloat(formData.cost) : null,
        technician: formData.technician || null,
        mileage: formData.mileage ? parseInt(formData.mileage) : null,
        next_service_mileage: formData.next_service_mileage ? parseInt(formData.next_service_mileage) : null,
        notes: formData.notes || null
      };

      if (editingRecord) {
        const { error } = await supabase
          .from('fleet_maintenance')
          .update(payload)
          .eq('id', editingRecord.id);
        
        if (error) throw error;
        toast.success('Maintenance record updated');
      } else {
        const { error } = await supabase
          .from('fleet_maintenance')
          .insert(payload);
        
        if (error) throw error;
        toast.success('Maintenance scheduled');
      }

      setIsDialogOpen(false);
      resetForm();
      fetchData();
    } catch (error) {
      console.error('Error saving maintenance:', error);
      toast.error('Failed to save maintenance record');
    }
  };

  const handleEdit = (record: MaintenanceRecord) => {
    setEditingRecord(record);
    setFormData({
      bike_id: record.bike_id || '',
      bike_name: record.bike_name,
      maintenance_type: record.maintenance_type,
      description: record.description || '',
      scheduled_date: new Date(record.scheduled_date),
      priority: record.priority,
      cost: record.cost?.toString() || '',
      technician: record.technician || '',
      mileage: record.mileage?.toString() || '',
      next_service_mileage: record.next_service_mileage?.toString() || '',
      notes: record.notes || ''
    });
    setIsDialogOpen(true);
  };

  const handleStatusChange = async (id: string, status: string) => {
    try {
      const updateData: { status: string; completed_date?: string | null } = { status };
      if (status === 'completed') {
        updateData.completed_date = format(new Date(), 'yyyy-MM-dd');
      } else {
        updateData.completed_date = null;
      }

      const { error } = await supabase
        .from('fleet_maintenance')
        .update(updateData)
        .eq('id', id);
      
      if (error) throw error;
      toast.success(`Status updated to ${status}`);
      fetchData();
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this maintenance record?')) return;
    
    try {
      const { error } = await supabase
        .from('fleet_maintenance')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      toast.success('Maintenance record deleted');
      fetchData();
    } catch (error) {
      console.error('Error deleting maintenance:', error);
      toast.error('Failed to delete maintenance record');
    }
  };

  // Filter records based on active tab
  const filteredRecords = records.filter(record => {
    switch (activeTab) {
      case 'upcoming':
        return record.status === 'scheduled' || record.status === 'in_progress';
      case 'overdue':
        return record.status === 'overdue';
      case 'completed':
        return record.status === 'completed';
      case 'all':
      default:
        return true;
    }
  });

  // Stats
  const upcomingCount = records.filter(r => r.status === 'scheduled' || r.status === 'in_progress').length;
  const overdueCount = records.filter(r => r.status === 'overdue').length;
  const completedCount = records.filter(r => r.status === 'completed').length;
  const highPriorityCount = records.filter(r => (r.priority === 'high' || r.priority === 'urgent') && r.status !== 'completed').length;

  const getScheduleLabel = (date: string) => {
    const scheduleDate = new Date(date);
    if (isToday(scheduleDate)) return 'Today';
    if (isTomorrow(scheduleDate)) return 'Tomorrow';
    if (isPast(scheduleDate)) return 'Overdue';
    return format(scheduleDate, 'MMM d, yyyy');
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <Clock className="w-8 h-8 text-primary" />
              <div>
                <p className="text-2xl font-bold">{upcomingCount}</p>
                <p className="text-xs text-muted-foreground">Upcoming</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-destructive/10 to-destructive/5 border-destructive/20">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-8 h-8 text-destructive" />
              <div>
                <p className="text-2xl font-bold">{overdueCount}</p>
                <p className="text-xs text-muted-foreground">Overdue</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-success/10 to-success/5 border-success/20">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-8 h-8 text-success" />
              <div>
                <p className="text-2xl font-bold">{completedCount}</p>
                <p className="text-xs text-muted-foreground">Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-accent/10 to-accent/5 border-accent/20">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-8 h-8 text-accent" />
              <div>
                <p className="text-2xl font-bold">{highPriorityCount}</p>
                <p className="text-xs text-muted-foreground">High Priority</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Wrench className="w-5 h-5 text-primary" />
              Fleet Maintenance Scheduler
            </CardTitle>
            <Dialog open={isDialogOpen} onOpenChange={(open) => {
              setIsDialogOpen(open);
              if (!open) resetForm();
            }}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Schedule Maintenance
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editingRecord ? 'Edit Maintenance Record' : 'Schedule New Maintenance'}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Bike *</Label>
                      <Select value={formData.bike_id} onValueChange={handleBikeSelect}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select bike" />
                        </SelectTrigger>
                        <SelectContent>
                          {bikes.map(bike => (
                            <SelectItem key={bike.id} value={bike.id}>{bike.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {!formData.bike_id && (
                        <Input
                          placeholder="Or enter bike name manually"
                          value={formData.bike_name}
                          onChange={(e) => setFormData(prev => ({ ...prev, bike_name: e.target.value }))}
                        />
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Maintenance Type *</Label>
                      <Select 
                        value={formData.maintenance_type} 
                        onValueChange={(v) => setFormData(prev => ({ ...prev, maintenance_type: v }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          {MAINTENANCE_TYPES.map(type => (
                            <SelectItem key={type} value={type}>{type}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea
                      placeholder="Describe the maintenance work..."
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Scheduled Date *</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="w-full justify-start text-left font-normal">
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {format(formData.scheduled_date, 'PPP')}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={formData.scheduled_date}
                            onSelect={(date) => date && setFormData(prev => ({ ...prev, scheduled_date: date }))}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Priority</Label>
                      <Select 
                        value={formData.priority} 
                        onValueChange={(v) => setFormData(prev => ({ ...prev, priority: v }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="normal">Normal</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="urgent">Urgent</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Estimated Cost (KES)</Label>
                      <Input
                        type="number"
                        placeholder="0"
                        value={formData.cost}
                        onChange={(e) => setFormData(prev => ({ ...prev, cost: e.target.value }))}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Technician</Label>
                      <Input
                        placeholder="Assigned technician"
                        value={formData.technician}
                        onChange={(e) => setFormData(prev => ({ ...prev, technician: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Current Mileage (km)</Label>
                      <Input
                        type="number"
                        placeholder="0"
                        value={formData.mileage}
                        onChange={(e) => setFormData(prev => ({ ...prev, mileage: e.target.value }))}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Next Service Mileage (km)</Label>
                      <Input
                        type="number"
                        placeholder="0"
                        value={formData.next_service_mileage}
                        onChange={(e) => setFormData(prev => ({ ...prev, next_service_mileage: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Notes</Label>
                    <Textarea
                      placeholder="Additional notes..."
                      value={formData.notes}
                      onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-4">
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">
                      {editingRecord ? 'Update' : 'Schedule'}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="upcoming" className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Upcoming ({upcomingCount})
              </TabsTrigger>
              <TabsTrigger value="overdue" className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Overdue ({overdueCount})
              </TabsTrigger>
              <TabsTrigger value="completed" className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Completed ({completedCount})
              </TabsTrigger>
              <TabsTrigger value="all">All</TabsTrigger>
            </TabsList>

            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : filteredRecords.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Wrench className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No maintenance records found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Bike</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Scheduled</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Technician</TableHead>
                      <TableHead>Cost</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRecords.map(record => (
                      <TableRow key={record.id}>
                        <TableCell className="font-medium">{record.bike_name}</TableCell>
                        <TableCell>{record.maintenance_type}</TableCell>
                        <TableCell>
                          <span className={cn(
                            record.status === 'overdue' && 'text-destructive font-medium'
                          )}>
                            {getScheduleLabel(record.scheduled_date)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge className={getPriorityColor(record.priority)}>
                            {record.priority}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={cn('flex items-center gap-1 w-fit', getStatusColor(record.status))}>
                            {getStatusIcon(record.status)}
                            {record.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{record.technician || '-'}</TableCell>
                        <TableCell>{record.cost ? `KES ${record.cost.toLocaleString()}` : '-'}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            {record.status !== 'completed' && (
                              <Select 
                                value={record.status}
                                onValueChange={(v) => handleStatusChange(record.id, v)}
                              >
                                <SelectTrigger className="w-[130px] h-8">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="scheduled">Scheduled</SelectItem>
                                  <SelectItem value="in_progress">In Progress</SelectItem>
                                  <SelectItem value="completed">Completed</SelectItem>
                                  <SelectItem value="cancelled">Cancelled</SelectItem>
                                </SelectContent>
                              </Select>
                            )}
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => handleEdit(record)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => handleDelete(record.id)}
                            >
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
