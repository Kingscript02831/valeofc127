
import { Navigate, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "../integrations/supabase/client";
import type { Database } from "../integrations/supabase/types";

type AdminPermission = Database["public"]["Enums"]["admin_permission"];

interface AdminProtectedRouteProps {
  children: React.ReactNode;
  requiredPermission?: AdminPermission;
}

const AdminProtectedRoute = ({ children, requiredPermission }: AdminProtectedRouteProps) => {
  const location = useLocation();

  const { data: session } = useQuery({
    queryKey: ["session"],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      return session;
    },
  });

  const { data: hasPermission } = useQuery({
    queryKey: ["admin-permission", session?.user.id, requiredPermission],
    queryFn: async () => {
      if (!session?.user.id || !requiredPermission) return true;

      const { data, error } = await supabase.rpc(
        'has_admin_permission',
        { 
          user_id: session.user.id,
          required_permission: requiredPermission
        }
      );

      if (error) throw error;
      return data;
    },
    enabled: !!session?.user.id && !!requiredPermission,
  });

  if (!session) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredPermission && !hasPermission) {
    return <Navigate to="/404" replace />;
  }

  return <>{children}</>;
};

export default AdminProtectedRoute;
