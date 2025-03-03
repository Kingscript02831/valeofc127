
import { useState } from "react";
import { Button } from "./ui/button";
import { supabase } from "../integrations/supabase/client";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";

/**
 * This component is for testing notifications
 * It can be removed in production
 */
const NotificationTester = () => {
  const [isLoading, setIsLoading] = useState(false);
  
  // Fetch current user
  const { data: currentUser } = useQuery({
    queryKey: ["currentUser"],
    queryFn: async () => {
      const { data } = await supabase.auth.getUser();
      return data.user;
    },
  });

  const createTestNotification = async () => {
    if (!currentUser) {
      toast.error("Usuário não autenticado");
      return;
    }
    
    setIsLoading(true);
    
    try {
      const { error } = await supabase.from("notifications").insert([
        {
          user_id: currentUser.id,
          sender_id: currentUser.id, // sending to ourselves for testing
          title: "Notificação de teste",
          message: "Esta é uma notificação de teste gerada manualmente",
          type: "test",
          read: false,
        },
      ]);
      
      if (error) throw error;
      
      toast.success("Notificação de teste criada com sucesso!");
    } catch (error) {
      console.error("Erro ao criar notificação de teste:", error);
      toast.error("Erro ao criar notificação de teste");
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
      <h3 className="text-lg font-medium mb-2">Teste de Notificações</h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
        Para testar o funcionamento das notificações, clique no botão abaixo.
      </p>
      <Button 
        onClick={createTestNotification} 
        disabled={isLoading}
        className="w-full"
      >
        {isLoading ? "Criando..." : "Criar notificação de teste"}
      </Button>
    </div>
  );
};

export default NotificationTester;
