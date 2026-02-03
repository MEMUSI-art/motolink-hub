import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Navigation, MapPin, CheckCircle, XCircle, Clock, Loader2, Eye, Trash2, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface RouteRequest {
  id: string;
  user_id: string | null;
  title: string;
  description: string | null;
  start_location: string;
  end_location: string;
  estimated_distance_km: number | null;
  difficulty: string | null;
  terrain_types: string[] | null;
  points_of_interest: string[] | null;
  contact_email: string | null;
  contact_phone: string | null;
  status: string;
  admin_notes: string | null;
  created_at: string;
}

const statusColors: Record<string, string> = {
  pending: 'bg-accent text-accent-foreground',
  reviewing: 'bg-primary text-primary-foreground',
  approved: 'bg-success text-white',
  rejected: 'bg-destructive text-destructive-foreground',
  published: 'bg-success text-white',
};

const difficultyColors: Record<string, string> = {
  easy: 'bg-success/20 text-success',
  moderate: 'bg-accent/20 text-accent-foreground',
  challenging: 'bg-warning/20 text-warning',
  expert: 'bg-destructive/20 text-destructive',
};

export default function RouteRequestsManager() {
  const queryClient = useQueryClient();
  const [selectedRequest, setSelectedRequest] = useState<RouteRequest | null>(null);
  const [adminNotes, setAdminNotes] = useState('');

  const { data: requests, isLoading } = useQuery({
    queryKey: ['route-requests'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('route_requests')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as RouteRequest[];
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, status, admin_notes }: { id: string; status: string; admin_notes?: string }) => {
      const { error } = await supabase
        .from('route_requests')
        .update({ status, admin_notes: admin_notes || null })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['route-requests'] });
      toast.success('Route request updated');
      setSelectedRequest(null);
    },
    onError: () => {
      toast.error('Failed to update request');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('route_requests').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['route-requests'] });
      toast.success('Route request deleted');
    },
    onError: () => {
      toast.error('Failed to delete request');
    },
  });

  const handleStatusUpdate = (id: string, status: string) => {
    updateMutation.mutate({ id, status, admin_notes: adminNotes });
  };

  const pendingCount = requests?.filter(r => r.status === 'pending').length || 0;
  const approvedCount = requests?.filter(r => r.status === 'approved' || r.status === 'published').length || 0;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-3xl font-bold">{requests?.length || 0}</p>
            <p className="text-sm text-muted-foreground">Total Suggestions</p>
          </CardContent>
        </Card>
        <Card className="bg-accent/10">
          <CardContent className="pt-6 text-center">
            <p className="text-3xl font-bold text-accent">{pendingCount}</p>
            <p className="text-sm text-muted-foreground">Pending Review</p>
          </CardContent>
        </Card>
        <Card className="bg-success/10">
          <CardContent className="pt-6 text-center">
            <p className="text-3xl font-bold text-success">{approvedCount}</p>
            <p className="text-sm text-muted-foreground">Approved</p>
          </CardContent>
        </Card>
        <Card className="bg-primary/10">
          <CardContent className="pt-6 text-center">
            <p className="text-3xl font-bold text-primary">
              {requests?.filter(r => r.status === 'published').length || 0}
            </p>
            <p className="text-sm text-muted-foreground">Published</p>
          </CardContent>
        </Card>
      </div>

      {/* Requests Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Navigation className="w-5 h-5 text-primary" />
            Route Suggestions
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!requests || requests.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No route suggestions yet</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Route</TableHead>
                    <TableHead>From → To</TableHead>
                    <TableHead>Difficulty</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {requests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{request.title}</p>
                          {request.estimated_distance_km && (
                            <p className="text-xs text-muted-foreground">{request.estimated_distance_km} km</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <span className="text-success">{request.start_location}</span>
                          <ArrowRight className="w-3 h-3 text-muted-foreground" />
                          <span className="text-destructive">{request.end_location}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={difficultyColors[request.difficulty || 'moderate']}>
                          {request.difficulty || 'moderate'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {request.contact_email && <p>{request.contact_email}</p>}
                          {request.contact_phone && <p className="text-muted-foreground">{request.contact_phone}</p>}
                          {!request.contact_email && !request.contact_phone && (
                            <span className="text-muted-foreground">No contact</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={statusColors[request.status]}>
                          {request.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {format(new Date(request.created_at), 'MMM d, yyyy')}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => {
                                  setSelectedRequest(request);
                                  setAdminNotes(request.admin_notes || '');
                                }}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>{request.title}</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <p className="text-sm text-muted-foreground">Route</p>
                                    <div className="flex items-center gap-2">
                                      <MapPin className="w-4 h-4 text-success" />
                                      <span>{request.start_location}</span>
                                      <ArrowRight className="w-4 h-4" />
                                      <MapPin className="w-4 h-4 text-destructive" />
                                      <span>{request.end_location}</span>
                                    </div>
                                  </div>
                                  <div>
                                    <p className="text-sm text-muted-foreground">Distance & Difficulty</p>
                                    <p>
                                      {request.estimated_distance_km ? `${request.estimated_distance_km} km` : 'N/A'} • {request.difficulty}
                                    </p>
                                  </div>
                                </div>

                                {request.description && (
                                  <div>
                                    <p className="text-sm text-muted-foreground">Description</p>
                                    <p>{request.description}</p>
                                  </div>
                                )}

                                {request.terrain_types && request.terrain_types.length > 0 && (
                                  <div>
                                    <p className="text-sm text-muted-foreground mb-1">Terrain Types</p>
                                    <div className="flex flex-wrap gap-1">
                                      {request.terrain_types.map((terrain, i) => (
                                        <Badge key={i} variant="outline">{terrain}</Badge>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {request.points_of_interest && request.points_of_interest.length > 0 && (
                                  <div>
                                    <p className="text-sm text-muted-foreground mb-1">Points of Interest</p>
                                    <div className="flex flex-wrap gap-1">
                                      {request.points_of_interest.map((poi, i) => (
                                        <Badge key={i} variant="secondary">{poi}</Badge>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                <div>
                                  <p className="text-sm text-muted-foreground mb-1">Admin Notes</p>
                                  <Textarea
                                    value={adminNotes}
                                    onChange={(e) => setAdminNotes(e.target.value)}
                                    placeholder="Add notes about this route suggestion..."
                                    rows={3}
                                  />
                                </div>

                                <div className="flex gap-2 pt-4">
                                  <Button
                                    variant="outline"
                                    onClick={() => handleStatusUpdate(request.id, 'reviewing')}
                                    disabled={updateMutation.isPending}
                                  >
                                    <Clock className="w-4 h-4" />
                                    Mark Reviewing
                                  </Button>
                                  <Button
                                    className="bg-success hover:bg-success/90"
                                    onClick={() => handleStatusUpdate(request.id, 'approved')}
                                    disabled={updateMutation.isPending}
                                  >
                                    <CheckCircle className="w-4 h-4" />
                                    Approve
                                  </Button>
                                  <Button
                                    variant="destructive"
                                    onClick={() => handleStatusUpdate(request.id, 'rejected')}
                                    disabled={updateMutation.isPending}
                                  >
                                    <XCircle className="w-4 h-4" />
                                    Reject
                                  </Button>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>

                          {request.status === 'pending' && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive hover:text-destructive"
                              onClick={() => deleteMutation.mutate(request.id)}
                              disabled={deleteMutation.isPending}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
