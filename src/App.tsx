
import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Componente inicial temporário
const PlaceholderComponent = () => (
  <div className="p-4">
    <h1>Em desenvolvimento</h1>
  </div>
);

const queryClient = new QueryClient();

const App: React.FC = () => {
  return (
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<PlaceholderComponent />} />
              <Route path="/eventos" element={<PlaceholderComponent />} />
              <Route path="/lugares" element={<PlaceholderComponent />} />
              <Route path="/lojas" element={<PlaceholderComponent />} />
              <Route path="/notify" element={<PlaceholderComponent />} />
              <Route path="/login" element={<PlaceholderComponent />} />
              <Route path="/signup" element={<PlaceholderComponent />} />
              <Route path="/perfil" element={<PlaceholderComponent />} />
              <Route path="/chat" element={<PlaceholderComponent />} />
              <Route path="/config" element={<PlaceholderComponent />} />
              <Route path="/admin/*" element={<PlaceholderComponent />} />
              <Route path="*" element={<PlaceholderComponent />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </React.StrictMode>
  );
};

export default App;
