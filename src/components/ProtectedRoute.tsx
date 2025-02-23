
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPermission: string;
}

const ProtectedRoute = ({ children, requiredPermission }: ProtectedRouteProps) => {
  const navigate = useNavigate();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkPermission = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          navigate('/404');
          return;
        }

        const { data: permissions, error } = await supabase
          .from('permissions')
          .select(`
            name,
            permissions_pages!inner(
              admin_pages!inner(
                path
              )
            )
          `)
          .eq('user_id', user.id);

        if (error) {
          console.error('Error fetching permissions:', error);
          toast.error('Erro ao verificar permissões');
          navigate('/404');
          return;
        }

        const hasPermission = permissions?.some(p => p.name === requiredPermission);
        
        if (!hasPermission) {
          navigate('/404');
          return;
        }

        setIsAuthorized(true);
      } catch (error) {
        console.error('Error in permission check:', error);
        navigate('/404');
      } finally {
        setIsLoading(false);
      }
    };

    checkPermission();
  }, [navigate, requiredPermission]);

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900"></div>
    </div>;
  }

  return isAuthorized ? children : null;
};

export default ProtectedRoute;
