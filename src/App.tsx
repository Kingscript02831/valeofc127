
import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";

// Create a new QueryClient instance outside of the component
const queryClient = new QueryClient();

// Create placeholder components for missing pages
const Events = () => <div>Events Page</div>;
const Places = () => <div>Places Page</div>;
const Stores = () => <div>Stores Page</div>;
const Login = () => <div>Login Page</div>;
const SignUp = () => <div>SignUp Page</div>;
const Config = () => <div>Config Page</div>;
const AdminPlaces = () => <div>Admin Places Page</div>;
const AdminEvents = () => <div>Admin Events Page</div>;
const AdminStores = () => <div>Admin Stores Page</div>;
const AdminNews = () => <div>Admin News Page</div>;
const Profile = () => <div>Profile Page</div>;

// Create the Navbar2 component
const Navbar2 = () => (
  <nav className="bg-gray-800 text-white p-4">
    <div className="container mx-auto">Admin Navigation</div>
  </nav>
);

// Create the SubNav2 component
const SubNav2 = () => (
  <nav className="bg-gray-100 p-2">
    <div className="container mx-auto">Admin Sub Navigation</div>
  </nav>
);

const App = () => {
  return (
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
            <Route path="/signup" element={<SignUp />} />
            <Route path="/perfil" element={<Profile />} />
            <Route path="/config" element={<Config />} />
            <Route path="/admin/*" element={<Admin />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

// Create the Admin component
const Admin = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar2 />
      <SubNav2 />
      <main className="container mx-auto px-4 py-8">
        <Routes>
          <Route path="lugares" element={<AdminPlaces />} />
          <Route path="eventos" element={<AdminEvents />} />
          <Route path="lojas" element={<AdminStores />} />
          <Route path="noticias" element={<AdminNews />} />
          <Route path="categorias" element={<AdminCategories />} />
        </Routes>
      </main>
    </div>
  );
};

// Create a NotFound component
const NotFound = () => (
  <div className="min-h-screen flex items-center justify-center">
    <h1 className="text-2xl">404 - Page Not Found</h1>
  </div>
);

// Create a basic AdminCategories component
const AdminCategories = () => {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Gerenciar Categorias</h1>
      <p>Loading...</p>
    </div>
  );
};

export default App;
