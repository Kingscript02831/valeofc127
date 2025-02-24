
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

interface AuthGuardProps {
  children: React.ReactNode;
  requiredPermission?: string;
}

const AuthGuard: React.FC<AuthGuardProps> = ({ children, requiredPermission }) => {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkPermission = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          navigate('/login');
          return;
        }

        // If no specific permission is required, allow access
        if (!requiredPermission) {
          setIsAuthorized(true);
          setIsLoading(false);
          return;
        }

        // Verify if user has permission for this page path
        const { data: userPermissions, error } = await supabase
          .from('permissions')
          .select('id, permission_name, page_path')
          .eq('email', user.email)
          .eq('page_path', requiredPermission)
          .limit(1)
          .single();

        if (error && error.code !== 'PGRST116') { // Ignore not found error
          throw error;
        }

        if (!userPermissions) {
          console.log('Permission denied for:', {
            email: user.email,
            requiredPath: requiredPermission
          });
          toast({
            title: "Acesso negado",
            description: "Você não tem permissão para acessar esta página",
            variant: "destructive",
          });
          navigate('/');
          return;
        }

        setIsAuthorized(true);
      } catch (error) {
        console.error('Error checking permissions:', error);
        toast({
          title: "Erro",
          description: "Erro ao verificar permissões",
          variant: "destructive",
        });
        navigate('/');
      } finally {
        setIsLoading(false);
      }
    };

    checkPermission();
  }, [navigate, requiredPermission]);

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Carregando...</div>;
  }

  return isAuthorized ? <>{children}</> : null;
};

export default AuthGuard;
