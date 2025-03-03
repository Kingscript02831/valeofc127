
import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

// Define public routes that don't require authentication
const publicRoutes = [
  "/login",
  "/signup",
  "/reset-password",
  "/update-password",
];

// Define admin-only routes
const adminRoutes = [
  "/admin",
  "/admin/lugares",
  "/admin/eventos",
  "/admin/noticias",
  "/admin/categorias",
  "/admin/sistema",
];

const AuthWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const checkUser = async () => {
      try {
        setLoading(true);
        
        // Check if the user is logged in
        const { data: { session } } = await supabase.auth.getSession();
        
        // Check if the route is admin-only
        const isAdminRoute = adminRoutes.some(route => 
          location.pathname.startsWith(route)
        );
        
        // If the route is admin-only, check if user has admin role
        if (isAdminRoute && session?.user) {
          // Get user profile and check for admin role
          const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', session.user.id)
            .single();
            
          setIsAdmin(profile?.role === 'admin');
          
          if (profile?.role !== 'admin') {
            navigate("/");
            return;
          }
        }
        
        // If the user is not logged in and the route is not public, redirect to login
        if (!session && !publicRoutes.some(route => location.pathname.startsWith(route))) {
          navigate("/login", { state: { from: location.pathname } });
        }
      } catch (error) {
        console.error("Auth check error:", error);
      } finally {
        setLoading(false);
      }
    };

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      checkUser();
    });

    checkUser();

    // Cleanup subscription
    return () => {
      subscription.unsubscribe();
    };
  }, [navigate, location.pathname]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return <>{children}</>;
};

export default AuthWrapper;
