
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface LocPostProps {
  userId: string;
}

const LocPost = ({ userId }: LocPostProps) => {
  const { data: userCity, isLoading } = useQuery({
    queryKey: ['userCity', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('city')
        .eq('id', userId)
        .single();
      
      if (error) {
        console.error("Error fetching user city:", error);
        return null;
      }
      
      return data?.city || 'Localização não disponível';
    },
    enabled: !!userId,
  });

  if (isLoading) {
    return <p className="text-sm text-muted-foreground font-medium uppercase">Carregando...</p>;
  }

  return (
    <p className="text-sm text-muted-foreground font-medium uppercase">
      {userCity || 'Localização não disponível'}
    </p>
  );
};

export default LocPost;
