
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
          console.log('Usuário não autenticado');
          toast.error('Você precisa estar logado para acessar esta página');
          navigate('/404');
          return;
        }

        // Busca o perfil do usuário para verificar se é admin
        const { data: profile } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('id', user.id)
          .single();

        // Se o usuário for admin, permite acesso a todas as páginas
        if (profile?.is_admin) {
          console.log('Usuário é admin, acesso permitido');
          setIsAuthorized(true);
          setIsLoading(false);
          return;
        }

        // Verifica se o usuário tem permissão específica
        const { data: permissions, error: permissionsError } = await supabase
          .from('permissions')
          .select('*')
          .eq('user_id', user.id)
          .eq('page_path', requiredPermission);

        if (permissionsError) {
          console.error('Erro ao verificar permissões:', permissionsError);
          toast.error('Erro ao verificar permissões');
          navigate('/404');
          return;
        }

        // Se encontrou permissão, autoriza o acesso
        if (permissions && permissions.length > 0) {
          console.log('Usuário tem permissão específica');
          setIsAuthorized(true);
        } else {
          console.log('Usuário não tem permissão');
          toast.error('Você não tem permissão para acessar esta página');
          navigate('/404');
        }
      } catch (error) {
        console.error('Erro ao verificar permissões:', error);
        toast.error('Erro ao verificar permissões');
        navigate('/404');
      } finally {
        setIsLoading(false);
      }
    };

    checkPermission();
  }, [navigate, requiredPermission]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return isAuthorized ? children : null;
};

export default ProtectedRoute;
