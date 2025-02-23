
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
          navigate('/login');
          return;
        }

        console.log('Verificando permissões para:', user.email);

        // Busca as permissões do usuário
        const { data: permissions, error: permissionsError } = await supabase
          .from('permissions')
          .select('*')
          .eq('email', user.email)
          .single();

        if (permissionsError) {
          console.error('Erro ao buscar permissões:', permissionsError);
          toast.error('Erro ao verificar permissões');
          navigate('/');
          return;
        }

        // Se encontrou permissão, autoriza o acesso
        if (permissions) {
          console.log('Permissões encontradas:', permissions);
          setIsAuthorized(true);
        } else {
          console.log('Nenhuma permissão encontrada');
          toast.error('Você não tem permissão para acessar esta página');
          navigate('/');
        }
      } catch (error) {
        console.error('Erro ao verificar permissões:', error);
        toast.error('Erro ao verificar permissões');
        navigate('/');
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
