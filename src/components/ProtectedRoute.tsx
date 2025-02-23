
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
        // Verificar se o usuário está autenticado
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          console.log('Usuário não autenticado');
          navigate('/404');
          return;
        }

        // Primeiro, verifica se a página requer alguma permissão
        const { data: pageData, error: pageError } = await supabase
          .from('admin_pages')
          .select('*')
          .eq('path', requiredPermission)
          .single();

        // Se a página não existir na tabela admin_pages, permite o acesso
        if (!pageData || pageError) {
          console.log('Página não encontrada em admin_pages, permitindo acesso');
          setIsAuthorized(true);
          setIsLoading(false);
          return;
        }

        // Verifica se o usuário tem a permissão necessária
        const { data: permissionData, error: permissionError } = await supabase
          .from('permissions')
          .select(`
            id,
            permission_name,
            permissions_pages!inner (
              page_id
            )
          `)
          .eq('user_id', user.id)
          .eq('permissions_pages.page_id', pageData.id);

        if (permissionError) {
          console.error('Erro ao verificar permissões:', permissionError);
          toast.error('Erro ao verificar permissões');
          navigate('/404');
          return;
        }

        if (!permissionData || permissionData.length === 0) {
          console.log('Usuário não tem permissão para acessar esta página');
          toast.error('Você não tem permissão para acessar esta página');
          navigate('/404');
          return;
        }

        console.log('Usuário autorizado');
        setIsAuthorized(true);

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
    return <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900"></div>
    </div>;
  }

  return isAuthorized ? children : null;
};

export default ProtectedRoute;
