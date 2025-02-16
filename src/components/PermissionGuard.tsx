
import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../integrations/supabase/client';

interface PermissionGuardProps {
  children: React.ReactNode;
}

const PermissionGuard = ({ children }: PermissionGuardProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;

  const { data: session } = useQuery({
    queryKey: ['session'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      return session;
    },
  });

  const { data: userPermissions, isLoading } = useQuery({
    queryKey: ['user-permissions', session?.user?.id],
    enabled: !!session?.user?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('admin_permissions')
        .select('*')
        .eq('user_id', session?.user?.id)
        .eq('is_active', true);

      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    const checkPermission = async () => {
      if (!session?.user) {
        navigate('/login');
        return;
      }

      if (!isLoading && userPermissions) {
        const hasPermission = userPermissions.some(permission => {
          // Verifica se é admin ou owner (acesso total)
          if (permission.permission === 'admin' || permission.permission === 'owner') {
            return true;
          }

          // Verifica permissão específica para a rota atual
          if (permission.path) {
            return currentPath.includes(permission.path);
          }

          return false;
        });

        if (!hasPermission) {
          console.log('Usuário sem permissão para acessar:', currentPath);
          navigate('/404');
        }
      }
    };

    checkPermission();
  }, [session, userPermissions, currentPath, isLoading, navigate]);

  if (isLoading) {
    return <div>Carregando...</div>;
  }

  return <>{children}</>;
};

export default PermissionGuard;
