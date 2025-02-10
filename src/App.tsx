
import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
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
import Permissao from "./pages/Permissao";
import { usePermissions } from "./hooks/usePermissions";
import { supabase } from "./integrations/supabase/client";

const queryClient = new QueryClient();

interface ProtectedRouteProps {
  permissionType: "admin_places" | "admin_events" | "admin_stores" | "admin_news" | "admin_categories";
  children: React.ReactNode;
}

const ProtectedRoute = ({ permissionType, children }: ProtectedRouteProps) => {
  const { hasPermission, isLoading } = usePermissions();

  if (isLoading) {
    return <div>Carregando...</div>;
  }

  if (!hasPermission(permissionType)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center p-8 bg-white rounded-lg shadow-md">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Acesso Negado</h1>
          <p className="text-gray-600 mb-4">
            Você não tem permissão para acessar esta página.
          </p>
          <button
            onClick={() => window.history.back()}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Voltar
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

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
              <Route path="/notify" element={<Notify />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<SignUp />} />
              <Route path="/perfil" element={<Profile />} />
              <Route path="/config" element={<Config />} />
              <Route path="/permissao" element={<Permissao />} />
              <Route path="/admin" element={<Admin />}>
                <Route
                  path="lugares"
                  element={
                    <ProtectedRoute permissionType="admin_places">
                      <AdminPlaces />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="eventos"
                  element={
                    <ProtectedRoute permissionType="admin_events">
                      <AdminEvents />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="lojas"
                  element={
                    <ProtectedRoute permissionType="admin_stores">
                      <AdminStores />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="noticias"
                  element={
                    <ProtectedRoute permissionType="admin_news">
                      <AdminNews />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="categorias"
                  element={
                    <ProtectedRoute permissionType="admin_categories">
                      <AdminCategories />
                    </ProtectedRoute>
                  }
                />
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
