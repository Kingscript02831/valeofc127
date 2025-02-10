
import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Events from "./pages/Events";
import Places from "./pages/Places";
import Stores from "./pages/Stores";
import Notify from "./pages/Notify";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import Config from "./pages/config";
import Admin from "./pages/Admin";
import AdminPlaces from "./pages/AdminPlaces";
import AdminEvents from "./pages/AdminEvents";
import AdminStores from "./pages/AdminStores";
import AdminNews from "./pages/AdminNews";
import AdminCategories from "./pages/AdminCategories";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";

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
              <Route path="/" element={<Index />} />
              <Route path="/eventos" element={<Events />} />
              <Route path="/lugares" element={<Places />} />
              <Route path="/lojas" element={<Stores />} />
              <Route path="/login" element={<Login />} />
              <Route path="/notify" element={<Notify />} />
              <Route path="/signup" element={<SignUp />} />
              <Route path="/perfil" element={<Profile />} />
              <Route path="/config" element={<Config />} />
              <Route path="/admin" element={<Admin />}>
                <Route path="lugares" element={<AdminPlaces />} />
                <Route path="eventos" element={<AdminEvents />} />
                <Route path="lojas" element={<AdminStores />} />
                <Route path="noticias" element={<AdminNews />} />
                <Route path="categorias" element={<AdminCategories />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </React.StrictMode>
  );
};

export default App;
