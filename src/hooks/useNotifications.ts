
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useNotifications = () => {
  const { toast } = useToast();

  return useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const { data: news, error } = await supabase
        .from("news")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(1);

      if (error) {
        console.error("Error fetching notifications:", error);
        throw error;
      }

      return news;
    },
    refetchInterval: 30000, // Verifica a cada 30 segundos
    onSuccess: (data) => {
      if (data && data.length > 0) {
        const latestNews = data[0];
        const lastChecked = localStorage.getItem("lastCheckedNews");
        
        if (!lastChecked || new Date(latestNews.created_at) > new Date(lastChecked)) {
          toast({
            title: "Nova notícia!",
            description: latestNews.title,
            duration: 5000,
          });
          
          localStorage.setItem("lastCheckedNews", latestNews.created_at);
        }
      }
    },
  });
};
