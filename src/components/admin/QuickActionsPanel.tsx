import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Zap, CheckCircle, XCircle, MessageCircle, Mail, 
  Phone, Loader2, ChevronRight, AlertCircle, MessageSquare
} from 'lucide-react';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from '@/components/ui/textarea';

interface BookingRow {
  id: string;
  user_id: string;
  bike_name: string | null;
  pickup_date: string;
  return_date: string;
  pickup_location: string;
  status: string;
  total_price: number;
  created_at: string;
}

interface ServiceRow {
  id: string;
  user_id: string;
  name: string;
  phone: string;
  bike: string;
  services: unknown;
  preferred_date: string;
  status: string;
  total_price: number;
  created_at: string;
}

interface ProfileInfo {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
}

interface QuickActionsPanelProps {
  bookings: BookingRow[];
  services: ServiceRow[];
  onStatusUpdate: () => void;
}

export default function QuickActionsPanel({ bookings, services, onStatusUpdate }: QuickActionsPanelProps) {
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [contactModal, setContactModal] = useState<{
    open: boolean;
    type: 'booking' | 'service';
    item: BookingRow | ServiceRow | null;
    profile: ProfileInfo | null;
  }>({ open: false, type: 'booking', item: null, profile: null });
  const [loadingProfile, setLoadingProfile] = useState(false);

  // Get pending items for quick actions
  const pendingBookings = bookings.filter(b => b.status === 'pending').slice(0, 3);
  const pendingServices = services.filter(s => s.status === 'pending').slice(0, 3);

  const updateBookingStatus = async (id: string, status: string) => {
    setUpdatingId(id);
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status })
        .eq('id', id);
      
      if (error) throw error;
      toast.success(`Booking ${status}`);
      onStatusUpdate();
    } catch (error) {
      toast.error('Failed to update booking');
    } finally {
      setUpdatingId(null);
    }
  };

  const updateServiceStatus = async (id: string, status: string) => {
    setUpdatingId(id);
    try {
      const { error } = await supabase
        .from('services')
        .update({ status })
        .eq('id', id);
      
      if (error) throw error;
      toast.success(`Service ${status}`);
      onStatusUpdate();
    } catch (error) {
      toast.error('Failed to update service');
    } finally {
      setUpdatingId(null);
    }
  };

  const openContactModal = async (item: BookingRow | ServiceRow, type: 'booking' | 'service') => {
    setLoadingProfile(true);
    setContactModal({ open: true, type, item, profile: null });
    
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('id, name, email, phone')
        .eq('id', item.user_id)
        .maybeSingle();
      
      setContactModal(prev => ({ ...prev, profile }));
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    } finally {
      setLoadingProfile(false);
    }
  };

  const openWhatsApp = (phone: string, customerName: string, itemType: string) => {
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const message = encodeURIComponent(
      `Hi ${customerName}! 👋 This is MotoLink Africa regarding your ${itemType}. How can we assist you today?`
    );
    window.open(`https://wa.me/${cleanPhone}?text=${message}`, '_blank');
  };

  const openEmail = (email: string, customerName: string, itemType: string, details: string) => {
    const subject = encodeURIComponent(`Your MotoLink ${itemType} - Update`);
    const body = encodeURIComponent(
      `Dear ${customerName},\n\nThank you for choosing MotoLink Africa!\n\nRegarding your ${itemType}:\n${details}\n\nBest regards,\nMotoLink Africa Team`
    );
    window.open(`mailto:${email}?subject=${subject}&body=${body}`, '_blank');
  };

  const openSMS = (phone: string, customerName: string, itemType: string) => {
    const cleanPhone = phone.replace(/[^0-9+]/g, '');
    const message = encodeURIComponent(
      `Hi ${customerName}! This is MotoLink Africa regarding your ${itemType}. Reply or call us for assistance.`
    );
    window.open(`sms:${cleanPhone}?body=${message}`, '_self');
  };

  const getContactDetails = () => {
    if (!contactModal.item) return { phone: '', name: '', email: '', details: '' };
    
    if (contactModal.type === 'booking') {
      const booking = contactModal.item as BookingRow;
      return {
        phone: contactModal.profile?.phone || '',
        name: contactModal.profile?.name || 'Customer',
        email: contactModal.profile?.email || '',
        details: `Bike: ${booking.bike_name || 'Rental'}\nDates: ${format(new Date(booking.pickup_date), 'MMM d')} - ${format(new Date(booking.return_date), 'MMM d')}\nLocation: ${booking.pickup_location}\nTotal: KES ${booking.total_price?.toLocaleString()}`
      };
    } else {
      const service = contactModal.item as ServiceRow;
      return {
        phone: service.phone || contactModal.profile?.phone || '',
        name: service.name || contactModal.profile?.name || 'Customer',
        email: contactModal.profile?.email || '',
        details: `Service for: ${service.bike}\nServices: ${Array.isArray(service.services) ? (service.services as string[]).join(', ') : 'N/A'}\nDate: ${format(new Date(service.preferred_date), 'MMM d, yyyy')}\nTotal: KES ${service.total_price?.toLocaleString()}`
      };
    }
  };

  const contactDetails = getContactDetails();

  return (
    <>
      <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-transparent">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <div className="p-2 rounded-lg bg-primary/20">
              <Zap className="w-5 h-5 text-primary" />
            </div>
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Pending Bookings */}
          {pendingBookings.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-primary" />
                Pending Bookings ({pendingBookings.length})
              </h4>
              <div className="space-y-2">
                {pendingBookings.map(booking => (
                  <div 
                    key={booking.id} 
                    className="flex items-center justify-between p-3 bg-background/80 rounded-lg border border-border/50"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{booking.bike_name || 'Bike Rental'}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(booking.pickup_date), 'MMM d')} • KES {booking.total_price?.toLocaleString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 ml-2">
                      <Button 
                        size="icon" 
                        variant="ghost"
                        className="h-8 w-8 text-primary hover:bg-primary/20"
                        onClick={() => openContactModal(booking, 'booking')}
                        title="Contact Customer"
                      >
                        <Phone className="w-4 h-4" />
                      </Button>
                      <Button 
                        size="icon" 
                        className="h-8 w-8"
                        onClick={() => updateBookingStatus(booking.id, 'confirmed')}
                        disabled={updatingId === booking.id}
                        title="Confirm Booking"
                      >
                        {updatingId === booking.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <CheckCircle className="w-4 h-4" />
                        )}
                      </Button>
                      <Button 
                        size="icon" 
                        variant="outline"
                        className="h-8 w-8 border-destructive/50 text-destructive hover:bg-destructive/10"
                        onClick={() => updateBookingStatus(booking.id, 'cancelled')}
                        disabled={updatingId === booking.id}
                        title="Cancel Booking"
                      >
                        <XCircle className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Pending Services */}
          {pendingServices.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-accent" />
                Service Requests ({pendingServices.length})
              </h4>
              <div className="space-y-2">
                {pendingServices.map(service => (
                  <div 
                    key={service.id} 
                    className="flex items-center justify-between p-3 bg-background/80 rounded-lg border border-border/50"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{service.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {service.bike} • {format(new Date(service.preferred_date), 'MMM d')}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 ml-2">
                      <Button 
                        size="icon" 
                        variant="ghost"
                        className="h-8 w-8 text-primary hover:bg-primary/20"
                        onClick={() => openContactModal(service, 'service')}
                        title="Contact Customer"
                      >
                        <Phone className="w-4 h-4" />
                      </Button>
                      <Button 
                        size="icon" 
                        className="h-8 w-8"
                        onClick={() => updateServiceStatus(service.id, 'confirmed')}
                        disabled={updatingId === service.id}
                        title="Confirm Service"
                      >
                        {updatingId === service.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <CheckCircle className="w-4 h-4" />
                        )}
                      </Button>
                      <Button 
                        size="icon" 
                        variant="outline"
                        className="h-8 w-8 border-destructive/50 text-destructive hover:bg-destructive/10"
                        onClick={() => updateServiceStatus(service.id, 'cancelled')}
                        disabled={updatingId === service.id}
                        title="Cancel Service"
                      >
                        <XCircle className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* No pending items */}
          {pendingBookings.length === 0 && pendingServices.length === 0 && (
            <div className="text-center py-6 text-muted-foreground">
              <CheckCircle className="w-10 h-10 mx-auto mb-2 text-success" />
              <p className="text-sm">All caught up! No pending items.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Contact Modal */}
      <Dialog open={contactModal.open} onOpenChange={(open) => setContactModal(prev => ({ ...prev, open }))}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Phone className="w-5 h-5 text-primary" />
              Contact Customer
            </DialogTitle>
            <DialogDescription>
              Choose how you'd like to reach out to this customer.
            </DialogDescription>
          </DialogHeader>
          
          {loadingProfile ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : (
            <div className="space-y-4">
              {/* Customer Info */}
              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="font-medium">{contactDetails.name}</p>
                {contactDetails.email && (
                  <p className="text-sm text-muted-foreground">{contactDetails.email}</p>
                )}
                {contactDetails.phone && (
                  <p className="text-sm text-muted-foreground">{contactDetails.phone}</p>
                )}
              </div>

              {/* Booking/Service Details */}
              <div className="p-4 bg-muted/30 rounded-lg">
                <p className="text-xs text-muted-foreground uppercase mb-1">
                  {contactModal.type === 'booking' ? 'Booking' : 'Service'} Details
                </p>
                <pre className="text-sm whitespace-pre-wrap font-sans">{contactDetails.details}</pre>
              </div>

              {/* Contact Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <Button
                  className="flex items-center gap-2"
                  onClick={() => {
                    if (contactDetails.phone) {
                      openWhatsApp(
                        contactDetails.phone, 
                        contactDetails.name, 
                        contactModal.type === 'booking' ? 'bike booking' : 'service request'
                      );
                    } else {
                      toast.error('No phone number available');
                    }
                  }}
                  disabled={!contactDetails.phone}
                >
                  <MessageCircle className="w-4 h-4" />
                  WhatsApp
                </Button>
                <Button
                  variant="outline"
                  className="flex items-center gap-2"
                  onClick={() => {
                    if (contactDetails.email) {
                      openEmail(
                        contactDetails.email,
                        contactDetails.name,
                        contactModal.type === 'booking' ? 'Bike Booking' : 'Service Request',
                        contactDetails.details
                      );
                    } else {
                      toast.error('No email available');
                    }
                  }}
                  disabled={!contactDetails.email}
                >
                  <Mail className="w-4 h-4" />
                  Email
                </Button>
              </div>

              {/* SMS & Call Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="secondary"
                  className="flex items-center gap-2"
                  onClick={() => {
                    if (contactDetails.phone) {
                      openSMS(
                        contactDetails.phone,
                        contactDetails.name,
                        contactModal.type === 'booking' ? 'bike booking' : 'service request'
                      );
                    } else {
                      toast.error('No phone number available');
                    }
                  }}
                  disabled={!contactDetails.phone}
                >
                  <MessageSquare className="w-4 h-4" />
                  SMS
                </Button>
                <Button
                  variant="secondary"
                  className="flex items-center gap-2"
                  onClick={() => {
                    if (contactDetails.phone) {
                      window.open(`tel:${contactDetails.phone}`, '_self');
                    } else {
                      toast.error('No phone number available');
                    }
                  }}
                  disabled={!contactDetails.phone}
                >
                  <Phone className="w-4 h-4" />
                  Call
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}