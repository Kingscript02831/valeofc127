
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

        if (!requiredPermission) {
          setIsAuthorized(true);
          setIsLoading(false);
          return;
        }

        // Check if user has permission for this page
        const { data: permissions, error } = await supabase
          .from('permissions')
          .select('*')
          .eq('email', user.email)
          .eq('page_path', requiredPermission);

        if (error) throw error;

        if (!permissions || permissions.length === 0) {
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
