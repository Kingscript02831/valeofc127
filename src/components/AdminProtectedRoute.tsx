
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

  const { data: hasPermission, isLoading } = useQuery({
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

      if (error) {
        console.error("Erro ao verificar permissão:", error);
        return false;
      }
      
      console.log("Resultado da verificação de permissão:", data);
      return data;
    },
    enabled: !!session?.user.id && !!requiredPermission,
    initialData: !requiredPermission // Se não há permissão requerida, começa como true
  });

  if (!session) {
    console.log("Sem sessão, redirecionando para login");
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Adiciona log para debug
  console.log("Estado atual:", {
    isLoading,
    hasPermission,
    requiredPermission,
    userId: session.user.id
  });

  // Se está carregando e tem permissão requerida, espera
  if (isLoading && requiredPermission) {
    return <div>Verificando permissões...</div>;
  }

  if (requiredPermission && !hasPermission) {
    console.log("Sem permissão necessária, redirecionando para 404");
    return <Navigate to="/404" replace />;
  }

  return <>{children}</>;
};

export default AdminProtectedRoute;
