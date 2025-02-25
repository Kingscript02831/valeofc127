import { lazy } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Index from "./pages/Index";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import ResetPassword from "./pages/ResetPassword";
import UpdatePassword from "./pages/UpdatePassword";
import Products from "./pages/Products";
import ProductDetails from "./pages/ProductDetails";
import Posts from "./pages/Posts";
import StoryView from "./pages/StoryView";
import Profile from "./pages/Profile";
import Events from "./pages/Events";
import Places from "./pages/Places";
import NotFound from "./pages/NotFound";
import Notify from "./pages/Notify";
import { ThemeProvider } from "./components/ThemeProvider";
import { Toaster } from "./components/ui/toaster";
import AuthWrapper from "./components/AuthWrapper";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "./App.css";

function App() {
  const queryClient = new QueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <BrowserRouter>
          <AuthWrapper>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<SignUp />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/update-password" element={<UpdatePassword />} />
              <Route path="/products" element={<Products />} />
              <Route path="/products/:id" element={<ProductDetails />} />
              <Route path="/posts" element={<Posts />} />
              <Route path="/stories/:id" element={<StoryView />} />
              <Route path="/perfil/:username" element={<Profile />} />
              <Route path="/events" element={<Events />} />
              <Route path="/places" element={<Places />} />
              <Route path="/notify" element={<Notify />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthWrapper>
          <Toaster />
        </BrowserRouter>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
