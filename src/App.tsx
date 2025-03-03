
import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "./components/ui/toaster";
import { Toaster as Sonner } from "./components/ui/sonner";
import { TooltipProvider } from "./components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "./components/ThemeProvider";
import Profile from "./pages/Profile";
import UserProfile from "./pages/UserProfile";
import FollowersPage from "./pages/FollowersPage";
import AuthWrapper from "./components/AuthWrapper";

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
                  <Route path="/perfil" element={<Profile />} />
                  <Route path="/perfil/:username" element={<UserProfile />} />
                  <Route path="/conexoes/:userId/:tab?" element={<FollowersPage />} />
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
