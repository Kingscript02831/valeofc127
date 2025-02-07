
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Eventos from "./pages/Eventos";
import Lugares from "./pages/Lugares";
import Lojas from "./pages/Lojas";
import Grupos from "./pages/Grupos";
import Doacao from "./pages/Doacao";
import Outros from "./pages/Outros";
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
          <Route path="/eventos" element={<Eventos />} />
          <Route path="/lugares" element={<Lugares />} />
          <Route path="/lojas" element={<Lojas />} />
          <Route path="/grupos" element={<Grupos />} />
          <Route path="/doacao" element={<Doacao />} />
          <Route path="/outros" element={<Outros />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
