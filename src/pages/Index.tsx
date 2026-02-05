import { Helmet } from 'react-helmet-async';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import HeroSection from '@/components/home/HeroSection';
import FeaturedBikes from '@/components/home/FeaturedBikes';
import ServicesSection from '@/components/home/ServicesSection';
import TestimonialsSection from '@/components/home/TestimonialsSection';
import AdSpaceSection from '@/components/home/AdSpaceSection';
import RidingSchoolSection from '@/components/home/RidingSchoolSection';
import NewsletterPopup from '@/components/NewsletterPopup';
import FeaturedTours from '@/components/home/FeaturedTours';

const Index = () => {
  return (
    <>
      <Helmet>
        <title>MotoLink Africa - Premium Motorcycle Rental & Services</title>
        <meta name="description" content="Africa's #1 motorcycle platform. Rent premium bikes, access expert mechanics, customize your ride, and get 24/7 SOS support. Ride with confidence." />
      </Helmet>
      
      <Navbar />
      <main>
        <HeroSection />
        <FeaturedBikes />
        <FeaturedTours />
        <ServicesSection />
        <RidingSchoolSection />
        <AdSpaceSection />
        <TestimonialsSection />
      </main>
      <Footer />
      <NewsletterPopup />
    </>
  );
};

export default Index;
