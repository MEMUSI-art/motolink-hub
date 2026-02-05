 import { useQuery } from '@tanstack/react-query';
 import { Link } from 'react-router-dom';
 import { Clock, Users, MapPin, ChevronLeft, ChevronRight, Mountain } from 'lucide-react';
 import { motion } from 'framer-motion';
 import { supabase } from '@/integrations/supabase/client';
 import { Button } from '@/components/ui/button';
 import { Badge } from '@/components/ui/badge';
 import { Card, CardContent } from '@/components/ui/card';
 import {
   Carousel,
   CarouselContent,
   CarouselItem,
   CarouselNext,
   CarouselPrevious,
 } from '@/components/ui/carousel';
 
 const difficultyColors: Record<string, string> = {
   easy: 'bg-success',
   moderate: 'bg-accent',
   challenging: 'bg-warning',
   expert: 'bg-destructive',
 };
 
 export default function FeaturedTours() {
   const { data: tours, isLoading } = useQuery({
     queryKey: ['featured-tours'],
     queryFn: async () => {
       const { data, error } = await supabase
         .from('guided_tours')
         .select('*')
         .eq('active', true)
         .order('created_at', { ascending: false })
         .limit(6);
       if (error) throw error;
       return data;
     },
   });
 
   const formatPrice = (price: number) => {
     return new Intl.NumberFormat('en-KE', {
       style: 'currency',
       currency: 'KES',
       maximumFractionDigits: 0,
     }).format(price);
   };
 
   if (isLoading) {
     return (
       <section className="py-16 bg-muted/30">
         <div className="container mx-auto px-4">
           <div className="text-center mb-12">
             <div className="h-8 bg-muted rounded w-64 mx-auto mb-4 animate-pulse" />
             <div className="h-4 bg-muted rounded w-96 mx-auto animate-pulse" />
           </div>
           <div className="grid md:grid-cols-3 gap-6">
             {[...Array(3)].map((_, i) => (
               <Card key={i} className="animate-pulse">
                 <div className="aspect-video bg-muted" />
                 <CardContent className="p-4 space-y-3">
                   <div className="h-6 bg-muted rounded" />
                   <div className="h-4 bg-muted rounded w-2/3" />
                 </CardContent>
               </Card>
             ))}
           </div>
         </div>
       </section>
     );
   }
 
   if (!tours || tours.length === 0) {
     return null;
   }
 
   return (
     <section className="py-16 bg-muted/30">
       <div className="container mx-auto px-4">
         <motion.div
           initial={{ opacity: 0, y: 20 }}
           whileInView={{ opacity: 1, y: 0 }}
           viewport={{ once: true }}
           className="text-center mb-12"
         >
           <h2 className="font-display text-3xl md:text-4xl text-foreground mb-4">
             FEATURED <span className="text-primary">TOURS</span>
           </h2>
           <p className="text-muted-foreground max-w-2xl mx-auto">
             Join our expert-led motorcycle tours and explore Kenya's most breathtaking landscapes
           </p>
         </motion.div>
 
         <Carousel
           opts={{
             align: 'start',
             loop: true,
           }}
           className="w-full"
         >
           <CarouselContent className="-ml-4">
             {tours.map((tour, index) => (
               <CarouselItem key={tour.id} className="pl-4 md:basis-1/2 lg:basis-1/3">
                 <motion.div
                   initial={{ opacity: 0, y: 20 }}
                   whileInView={{ opacity: 1, y: 0 }}
                   viewport={{ once: true }}
                   transition={{ delay: index * 0.1 }}
                 >
                   <Card className="group overflow-hidden hover-lift h-full flex flex-col">
                     <div className="aspect-video relative overflow-hidden bg-muted">
                       {tour.images && tour.images[0] ? (
                         <img
                           src={tour.images[0]}
                           alt={tour.title}
                           className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                         />
                       ) : (
                         <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-accent/20">
                           <Mountain className="w-16 h-16 text-primary/50" />
                         </div>
                       )}
                       {tour.difficulty && (
                         <Badge className={`absolute top-3 left-3 ${difficultyColors[tour.difficulty]} text-white`}>
                           {tour.difficulty}
                         </Badge>
                       )}
                     </div>
 
                     <CardContent className="p-5 flex-1 flex flex-col">
                       <h3 className="font-display text-xl text-card-foreground mb-2 line-clamp-1">
                         {tour.title}
                       </h3>
                       <p className="text-sm text-muted-foreground mb-4 line-clamp-2 flex-1">
                         {tour.description}
                       </p>
 
                       <div className="flex flex-wrap gap-3 text-sm text-muted-foreground mb-4">
                         <span className="flex items-center gap-1">
                           <Clock className="w-4 h-4" />
                           {tour.duration_hours}h
                         </span>
                         <span className="flex items-center gap-1">
                           <Users className="w-4 h-4" />
                           Max {tour.max_participants}
                         </span>
                         <span className="flex items-center gap-1">
                           <MapPin className="w-4 h-4" />
                           {tour.meeting_point}
                         </span>
                       </div>
 
                       <div className="flex items-center justify-between mt-auto pt-4 border-t border-border">
                         <div>
                           <span className="text-xs text-muted-foreground">From</span>
                           <p className="font-display text-xl text-primary">
                             {formatPrice(tour.price_per_person)}
                           </p>
                         </div>
                         <Button variant="hero" size="sm" asChild>
                           <Link to="/tours">View Details</Link>
                         </Button>
                       </div>
                     </CardContent>
                   </Card>
                 </motion.div>
               </CarouselItem>
             ))}
           </CarouselContent>
           <CarouselPrevious className="hidden md:flex -left-4" />
           <CarouselNext className="hidden md:flex -right-4" />
         </Carousel>
 
         <motion.div
           initial={{ opacity: 0, y: 20 }}
           whileInView={{ opacity: 1, y: 0 }}
           viewport={{ once: true }}
           className="text-center mt-10"
         >
           <Button variant="outline" size="lg" asChild>
             <Link to="/tours">
               Explore All Tours
               <ChevronRight className="w-4 h-4" />
             </Link>
           </Button>
         </motion.div>
       </div>
     </section>
   );
 }