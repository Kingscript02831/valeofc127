
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface LocPostProps {
  userId: string;
}

const LocPost: React.FC<LocPostProps> = ({ userId }) => {
  const [city, setCity] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserCity = async () => {
      if (!userId) return;

      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("profiles")
          .select("city")
          .eq("id", userId)
          .single();

        if (error) {
          console.error("Error fetching user city:", error);
        } else if (data) {
          setCity(data.city);
        }
      } catch (error) {
        console.error("Error in LocPost component:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserCity();
  }, [userId]);

  if (loading) {
    return <p className="text-sm text-muted-foreground font-medium uppercase">Carregando...</p>;
  }

  if (!city) {
    return <p className="text-sm text-muted-foreground font-medium uppercase">Localização não disponível</p>;
  }

  return <p className="text-sm text-muted-foreground font-medium uppercase">{city}</p>;
};

export default LocPost;
