
import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./components/ThemeProvider";
import AuthWrapper from "./components/AuthWrapper";
import Index from "./pages/Index";
import Events from "./pages/Events";
import Places from "./pages/Places";
import Products from "./pages/Products";
import ProductDetails from "./pages/ProductDetails";
import ProductForm from "./pages/ProductForm";
import Notify from "./pages/Notify";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import Config from "./pages/config";
import Admin from "./pages/Admin";
import AdminPlaces from "./pages/AdminPlaces";
import AdminEvents from "./pages/AdminEvents";
import AdminNews from "./pages/AdminNews";
import AdminCategories from "./pages/AdminCategories";
import AdminSistema from "./pages/AdminSistema";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound"; 
import ResetPassword from "./pages/ResetPassword";
import UpdatePassword from "./pages/UpdatePassword";
import UserProducts from "./pages/UserProducts";
import NewsDetails from "./pages/NewsDetails";
import Posts from "./pages/Posts";

const queryClient = new QueryClient();

const App: React.FC = () => {
  return (
    <React.StrictMode>
      <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <AuthWrapper>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/eventos" element={<Events />} />
                  <Route path="/lugares" element={<Places />} />
                  <Route path="/products" element={<Products />} />
                  <Route path="/product/:id" element={<ProductDetails />} />
                  <Route path="/products/new" element={<ProductForm />} />
                  <Route path="/notify" element={<Notify />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/signup" element={<SignUp />} />
                  <Route path="/perfil" element={<Profile />} />
                  <Route path="/config" element={<Config />} />
                  <Route path="/reset-password" element={<ResetPassword />} />
                  <Route path="/update-password" element={<UpdatePassword />} />
                  <Route path="/posts" element={<Posts />} />
                  <Route path="/admin" element={<Admin />}>    
                    <Route path="lugares" element={<AdminPlaces />} />
                    <Route path="eventos" element={<AdminEvents />} />
                    <Route path="noticias" element={<AdminNews />} />
                    <Route path="categorias" element={<AdminCategories />} />
                    <Route path="sistema" element={<AdminSistema />} />
                  </Route> 
                  <Route path="/user-products" element={<UserProducts />} />
                  <Route path="/noticias/:id" element={<NewsDetails />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </AuthWrapper>
            </BrowserRouter>
          </TooltipProvider>
        </QueryClientProvider>
      </ThemeProvider>
    </React.StrictMode>
  );
};

export default App;
