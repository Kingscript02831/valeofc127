
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
        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          console.log('No user found');
          navigate('/login');
          return;
        }

        // If no permission required, allow access
        if (!requiredPermission) {
          setIsAuthorized(true);
          setIsLoading(false);
          return;
        }

        // Log check attempt
        console.log('Checking permission:', {
          userEmail: user.email,
          requiredPath: requiredPermission
        });

        // Simple query to check permission
        const { data, error } = await supabase
          .from('permissions')
          .select('*')
          .eq('email', user.email)
          .single();

        // Log results
        console.log('Permission check result:', { data, error });

        if (error) {
          console.error('Permission check error:', error);
          throw error;
        }

        if (!data) {
          console.log('No permission found');
          toast({
            title: "Acesso negado",
            description: "Você não tem permissão para acessar esta página",
            variant: "destructive",
          });
          navigate('/');
          return;
        }

        // Check if the page_path matches
        if (data.page_path !== requiredPermission) {
          console.log('Permission mismatch:', {
            required: requiredPermission,
            found: data.page_path
          });
          toast({
            title: "Acesso negado",
            description: "Você não tem permissão para acessar esta página",
            variant: "destructive",
          });
          navigate('/');
          return;
        }

        // If we got here, user is authorized
        console.log('Access granted');
        setIsAuthorized(true);

      } catch (error) {
        console.error('Auth check failed:', error);
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
