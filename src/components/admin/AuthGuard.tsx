
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

        console.log('Checking permission for:', {
          email: user.email,
          requiredPath: requiredPermission
        });

        // First get the user's permissions
        const { data: permissions, error: permissionsError } = await supabase
          .from('permissions')
          .select(`
            id,
            email,
            page_path
          `)
          .eq('email', user.email);

        if (permissionsError) {
          console.error('Error fetching permissions:', permissionsError);
          throw permissionsError;
        }

        console.log('User permissions:', permissions);

        // Check if the user has the required permission
        const hasPermission = permissions?.some(
          permission => permission.page_path === requiredPermission
        );

        if (!hasPermission) {
          console.log('Permission denied. Available permissions:', permissions);
          toast({
            title: "Acesso negado",
            description: "Você não tem permissão para acessar esta página",
            variant: "destructive",
          });
          navigate('/');
          return;
        }

        console.log('Permission granted');
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
