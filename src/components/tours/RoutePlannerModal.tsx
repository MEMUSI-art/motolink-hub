 import { useState, useEffect } from 'react';
 import { MapPin, Navigation, Download, ExternalLink, Clock, Bike, Calendar, Share2, Copy, Check } from 'lucide-react';
 import { toast } from 'sonner';
 import { Link } from 'react-router-dom';
 import { Button } from '@/components/ui/button';
 import { Badge } from '@/components/ui/badge';
 import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
 import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
 import { Card, CardContent } from '@/components/ui/card';
 import { Input } from '@/components/ui/input';
 import { Label } from '@/components/ui/label';
 import { Calendar as CalendarComponent } from '@/components/ui/calendar';
 import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
 import { format } from 'date-fns';
 import { cn } from '@/lib/utils';
 
 interface SelfGuidedRoute {
   id: string;
   title: string;
   description: string | null;
   difficulty: string | null;
   distance_km: number;
   estimated_hours: number;
   start_point: string;
   end_point: string;
   terrain_type: string[] | null;
   tips: string[] | null;
   map_url: string | null;
   gpx_file_url: string | null;
   images: string[] | null;
 }
 
 interface RoutePlannerModalProps {
   route: SelfGuidedRoute | null;
   isOpen: boolean;
   onClose: () => void;
 }
 
 const difficultyColors: Record<string, string> = {
   easy: 'bg-success text-white',
   moderate: 'bg-accent text-white',
   challenging: 'bg-warning text-white',
   expert: 'bg-destructive text-white',
 };
 
 export default function RoutePlannerModal({ route, isOpen, onClose }: RoutePlannerModalProps) {
   const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
   const [copied, setCopied] = useState(false);
   const [companions, setCompanions] = useState('1');
 
   useEffect(() => {
     if (isOpen) {
       setCopied(false);
       setSelectedDate(undefined);
       setCompanions('1');
     }
   }, [isOpen]);
 
   if (!route) return null;
 
   const shareUrl = typeof window !== 'undefined' 
     ? `${window.location.origin}/tours?route=${route.id}` 
     : '';
 
   const handleCopyLink = async () => {
     try {
       await navigator.clipboard.writeText(shareUrl);
       setCopied(true);
       toast.success('Link copied to clipboard!');
       setTimeout(() => setCopied(false), 2000);
     } catch {
       toast.error('Failed to copy link');
     }
   };
 
   const handleShareWhatsApp = () => {
     const text = `Check out this amazing motorcycle route: ${route.title}\n\n📍 ${route.start_point} → ${route.end_point}\n📏 ${route.distance_km}km | ⏱️ ~${route.estimated_hours}h\n\n${shareUrl}`;
     window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
   };
 
   const handleAddToCalendar = () => {
     if (!selectedDate) {
       toast.error('Please select a date first');
       return;
     }
     
     const startTime = new Date(selectedDate);
     startTime.setHours(8, 0, 0); // Start at 8 AM
     const endTime = new Date(startTime);
     endTime.setHours(startTime.getHours() + route.estimated_hours);
     
     const formatCalendarDate = (date: Date) => date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
     
     const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(`🏍️ ${route.title}`)}&dates=${formatCalendarDate(startTime)}/${formatCalendarDate(endTime)}&details=${encodeURIComponent(`Motorcycle Route: ${route.start_point} → ${route.end_point}\n\nDistance: ${route.distance_km}km\nEstimated Time: ${route.estimated_hours} hours\nDifficulty: ${route.difficulty}\n\n${route.description || ''}\n\nPlanned via MotoLink Africa`)}&location=${encodeURIComponent(route.start_point)}`;
     
     window.open(calendarUrl, '_blank');
     toast.success('Opening Google Calendar...');
   };
 
   return (
     <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
       <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
         <DialogHeader>
           <DialogTitle className="flex items-center gap-2 text-xl">
             <Navigation className="w-5 h-5 text-primary" />
             Plan Your Ride
           </DialogTitle>
           <DialogDescription>
             Prepare for {route.title}
           </DialogDescription>
         </DialogHeader>
 
         <div className="space-y-6">
           {/* Route Overview */}
           <Card>
             <CardContent className="p-4">
               <div className="flex items-start gap-4">
                 {route.images && route.images[0] && (
                   <img 
                     src={route.images[0]} 
                     alt={route.title} 
                     className="w-24 h-24 object-cover rounded-lg"
                   />
                 )}
                 <div className="flex-1">
                   <div className="flex items-center gap-2 mb-2">
                     <h3 className="font-display text-lg">{route.title}</h3>
                     {route.difficulty && (
                       <Badge className={difficultyColors[route.difficulty]}>
                         {route.difficulty}
                       </Badge>
                     )}
                   </div>
                   <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                     <span className="flex items-center gap-1">
                       <Navigation className="w-4 h-4" />
                       {route.distance_km} km
                     </span>
                     <span className="flex items-center gap-1">
                       <Clock className="w-4 h-4" />
                       ~{route.estimated_hours}h
                     </span>
                   </div>
                   <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
                     <MapPin className="w-4 h-4 text-success" />
                     <span>{route.start_point}</span>
                     <span>→</span>
                     <MapPin className="w-4 h-4 text-destructive" />
                     <span>{route.end_point}</span>
                   </div>
                 </div>
               </div>
             </CardContent>
           </Card>
 
           <Tabs defaultValue="schedule" className="w-full">
             <TabsList className="grid w-full grid-cols-3">
               <TabsTrigger value="schedule">
                 <Calendar className="w-4 h-4 mr-2" />
                 Schedule
               </TabsTrigger>
               <TabsTrigger value="resources">
                 <Download className="w-4 h-4 mr-2" />
                 Resources
               </TabsTrigger>
               <TabsTrigger value="share">
                 <Share2 className="w-4 h-4 mr-2" />
                 Share
               </TabsTrigger>
             </TabsList>
 
             {/* Schedule Tab */}
             <TabsContent value="schedule" className="space-y-4 mt-4">
               <div className="grid md:grid-cols-2 gap-4">
                 <div>
                   <Label className="mb-2 block">Select Ride Date</Label>
                   <Popover>
                     <PopoverTrigger asChild>
                       <Button
                         variant="outline"
                         className={cn(
                           "w-full justify-start text-left font-normal",
                           !selectedDate && "text-muted-foreground"
                         )}
                       >
                         <Calendar className="mr-2 h-4 w-4" />
                         {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
                       </Button>
                     </PopoverTrigger>
                     <PopoverContent className="w-auto p-0" align="start">
                       <CalendarComponent
                         mode="single"
                         selected={selectedDate}
                         onSelect={setSelectedDate}
                         disabled={(date) => date < new Date()}
                         initialFocus
                       />
                     </PopoverContent>
                   </Popover>
                 </div>
                 <div>
                   <Label htmlFor="companions" className="mb-2 block">Number of Riders</Label>
                   <Input
                     id="companions"
                     type="number"
                     min="1"
                     max="20"
                     value={companions}
                     onChange={(e) => setCompanions(e.target.value)}
                   />
                 </div>
               </div>
 
               <Button 
                 onClick={handleAddToCalendar} 
                 variant="hero" 
                 className="w-full"
                 disabled={!selectedDate}
               >
                 <Calendar className="w-4 h-4" />
                 Add to Google Calendar
               </Button>
 
               {route.tips && route.tips.length > 0 && (
                 <div className="bg-muted/50 rounded-lg p-4">
                   <h4 className="font-semibold mb-2">Pro Tips</h4>
                   <ul className="text-sm text-muted-foreground space-y-1">
                     {route.tips.map((tip, i) => (
                       <li key={i} className="flex items-start gap-2">
                         <span className="text-primary">•</span>
                         {tip}
                       </li>
                     ))}
                   </ul>
                 </div>
               )}
             </TabsContent>
 
              {/* Resources Tab */}
              <TabsContent value="resources" className="space-y-4 mt-4">
                <div className="grid gap-3">
                  {/* Navigate with Google Maps */}
                  <Button 
                    variant="hero" 
                    className="w-full justify-start" 
                    onClick={() => {
                      const origin = encodeURIComponent(route.start_point);
                      const destination = encodeURIComponent(route.end_point);
                      const mapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&travelmode=driving`;
                      window.open(mapsUrl, '_blank');
                    }}
                  >
                    <Navigation className="w-4 h-4 mr-2" />
                    Navigate with Google Maps
                  </Button>
                  {route.map_url && (
                    <Button variant="outline" className="w-full justify-start" asChild>
                      <a href={route.map_url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        View Interactive Map
                      </a>
                    </Button>
                  )}
                  {route.gpx_file_url && (
                    <Button variant="outline" className="w-full justify-start" asChild>
                      <a href={route.gpx_file_url} download>
                        <Download className="w-4 h-4 mr-2" />
                        Download GPX File
                      </a>
                    </Button>
                  )}
                </div>
 
               {route.terrain_type && route.terrain_type.length > 0 && (
                 <div>
                   <h4 className="font-semibold mb-2">Terrain Types</h4>
                   <div className="flex flex-wrap gap-2">
                     {route.terrain_type.map((terrain, i) => (
                       <Badge key={i} variant="outline">{terrain}</Badge>
                     ))}
                   </div>
                 </div>
               )}
 
               <Card className="bg-primary/5 border-primary/20">
                 <CardContent className="p-4">
                   <div className="flex items-center gap-3">
                     <Bike className="w-8 h-8 text-primary" />
                     <div>
                       <h4 className="font-semibold">Need a bike?</h4>
                       <p className="text-sm text-muted-foreground">Rent a motorcycle for your adventure</p>
                     </div>
                     <Button variant="default" size="sm" className="ml-auto" asChild>
                       <Link to="/hire">Browse Bikes</Link>
                     </Button>
                   </div>
                 </CardContent>
               </Card>
             </TabsContent>
 
             {/* Share Tab */}
             <TabsContent value="share" className="space-y-4 mt-4">
               <div>
                 <Label className="mb-2 block">Share Link</Label>
                 <div className="flex gap-2">
                   <Input value={shareUrl} readOnly className="bg-muted" />
                   <Button variant="outline" onClick={handleCopyLink}>
                     {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                   </Button>
                 </div>
               </div>
 
               <Button 
                 variant="success" 
                 className="w-full"
                 onClick={handleShareWhatsApp}
               >
                 <Share2 className="w-4 h-4" />
                 Share via WhatsApp
               </Button>
 
               <p className="text-sm text-muted-foreground text-center">
                 Invite your riding buddies to join you on this adventure!
               </p>
             </TabsContent>
           </Tabs>
         </div>
       </DialogContent>
     </Dialog>
   );
 }