
import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const AuthWrapper = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Escuta mudanças no estado de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === "SIGNED_OUT") {
          // Limpa o cache e sessão
          sessionStorage.clear();
          localStorage.removeItem("sb-cxnktrfpqjjkdfmiyhdz-auth-token");
          
          // Força redirecionamento para a página inicial
          navigate("/", { 
            replace: true 
          });

          // Força um reload da página após o redirecionamento
          setTimeout(() => {
            window.location.reload();
          }, 100);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  return <>{children}</>;
};

export default AuthWrapper;
