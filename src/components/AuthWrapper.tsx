
import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const AuthWrapper = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Adiciona headers de controle de cache
    if (typeof window !== "undefined") {
      // Previne cache no navegador
      window.onpageshow = function(event) {
        if (event.persisted) {
          // Se a página foi carregada do cache do navegador (botão voltar)
          window.location.href = "/";
        }
      };

      // Força o não-cache para páginas sensíveis
      if (document.location.pathname !== "/") {
        // Adiciona headers de cache-control
        const meta = document.createElement('meta');
        meta.httpEquiv = 'Cache-Control';
        meta.content = 'no-cache, no-store, must-revalidate';
        document.getElementsByTagName('head')[0].appendChild(meta);

        // Adiciona headers de pragma e expires
        const pragmaMeta = document.createElement('meta');
        pragmaMeta.httpEquiv = 'Pragma';
        pragmaMeta.content = 'no-cache';
        document.getElementsByTagName('head')[0].appendChild(pragmaMeta);

        const expiresMeta = document.createElement('meta');
        expiresMeta.httpEquiv = 'Expires';
        expiresMeta.content = '0';
        document.getElementsByTagName('head')[0].appendChild(expiresMeta);
      }
    }

    // Escuta mudanças no estado de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === "SIGNED_OUT") {
          // Limpa o cache do histórico
          if (typeof window !== "undefined") {
            // Remove entradas do histórico
            window.history.replaceState(null, "", "/");
            
            // Força redirecionamento para a página inicial
            navigate("/", { 
              replace: true,
              state: { 
                fromLogout: true,
                timestamp: Date.now() 
              } 
            });

            // Limpa qualquer cache de sessão
            sessionStorage.clear();
            
            // Adiciona um listener temporário para o evento popstate
            const handlePopState = () => {
              window.location.href = "/";
              window.removeEventListener('popstate', handlePopState);
            };
            window.addEventListener('popstate', handlePopState);
          }
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
