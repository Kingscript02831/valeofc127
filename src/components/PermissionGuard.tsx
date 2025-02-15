
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

const PAGE_PERMISSIONS = {
  admin: ["/admin", "/admin/noticias", "/admin/eventos", "/admin/lugares", "/admin/lojas", "/admin/categorias", "/admin/permissoes", "/config"],
  editor: ["/admin/noticias", "/admin/eventos", "/admin/lugares", "/admin/lojas"],
  viewer: ["/admin"]
};

interface PermissionGuardProps {
  children: React.ReactNode;
  requiredPath: string;
}

const PermissionGuard = ({ children, requiredPath }: PermissionGuardProps) => {
  const navigate = useNavigate();

  const { data: permission, isLoading } = useQuery({
    queryKey: ['user-permission'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return null;

      const { data, error } = await supabase
        .from('admin_permissions')
        .select('permission')
        .eq('user_id', session.user.id)
        .eq('is_active', true)
        .single();

      if (error || !data) return null;
      return data.permission;
    },
  });

  useEffect(() => {
    if (!isLoading) {
      if (!permission) {
        navigate('/404');
        return;
      }

      const allowedPaths = PAGE_PERMISSIONS[permission as keyof typeof PAGE_PERMISSIONS] || [];
      if (!allowedPaths.includes(requiredPath)) {
        navigate('/404');
      }
    }
  }, [permission, isLoading, navigate, requiredPath]);

  if (isLoading) {
    return <div>Carregando...</div>;
  }

  return <>{children}</>;
};

export default PermissionGuard;
