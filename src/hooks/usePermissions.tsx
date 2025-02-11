
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

export type PermissionType = 'admin_places' | 'admin_events' | 'admin_stores' | 'admin_news' | 'admin_categories';

export const usePermissions = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [permissions, setPermissions] = useState<PermissionType[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const checkPermissions = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          navigate('/login');
          return;
        }

        const { data: userPermissions, error } = await supabase
          .from('user_permissions')
          .select('permission')
          .eq('user_id', user.id);

        if (error) throw error;

        setPermissions(userPermissions.map(p => p.permission as PermissionType));
      } catch (error) {
        console.error('Error checking permissions:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkPermissions();
  }, [navigate]);

  const hasPermission = (requiredPermission: PermissionType) => {
    return permissions.includes(requiredPermission);
  };

  return { isLoading, hasPermission };
};
