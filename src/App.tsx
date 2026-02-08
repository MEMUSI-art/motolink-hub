import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { AuthProvider } from "@/contexts/AuthContext";
import WhatsAppButton from "@/components/shared/WhatsAppButton";
import Index from "./pages/Index";
import Hire from "./pages/Hire";
import Mechanic from "./pages/Mechanic";
import Garage from "./pages/Garage";
import SOS from "./pages/SOS";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Admin from "./pages/Admin";
import ListBike from "./pages/ListBike";
import Marketplace from "./pages/Marketplace";
import SellVehicle from "./pages/SellVehicle";
import Tours from "./pages/Tours";
import PartsRequest from "./pages/PartsRequest";
import FleetServices from "./pages/FleetServices";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/hire" element={<Hire />} />
              <Route path="/mechanic" element={<Mechanic />} />
              <Route path="/garage" element={<Garage />} />
              <Route path="/sos" element={<SOS />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/list-bike" element={<ListBike />} />
              <Route path="/marketplace" element={<Marketplace />} />
              <Route path="/sell-vehicle" element={<SellVehicle />} />
              <Route path="/tours" element={<Tours />} />
              <Route path="/parts-request" element={<PartsRequest />} />
              <Route path="/fleet-services" element={<FleetServices />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
            <WhatsAppButton phoneNumber="254707931926" message="Hello! I need help with MotoLink Africa." />
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
