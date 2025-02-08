
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Events from "./pages/Events";
import Places from "./pages/Places";
import Stores from "./pages/Stores";
import Admin from "./pages/Admin";
import AdminPlaces from "./pages/AdminPlaces";
import AdminEvents from "./pages/AdminEvents";
import AdminNews from "./pages/AdminNews";
import AdminStores from "./pages/AdminStores";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/eventos" element={<Events />} />
          <Route path="/lugares" element={<Places />} />
          <Route path="/lojas" element={<Stores />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/admin/lugares" element={<AdminPlaces />} />
          <Route path="/admin/eventos" element={<AdminEvents />} />
          <Route path="/admin/noticias" element={<AdminNews />} />
          <Route path="/admin/lojas" element={<AdminStores />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

