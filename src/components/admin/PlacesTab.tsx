
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface PlacesTabProps {
  searchPlaceTerm: string;
  setSearchPlaceTerm: (term: string) => void;
}

const PlacesTab = ({ searchPlaceTerm, setSearchPlaceTerm }: PlacesTabProps) => {
  const { data: places } = useQuery({
    queryKey: ['places', searchPlaceTerm],
    queryFn: async () => {
      const query = supabase
        .from('places')
        .select('*')
        .order('created_at', { ascending: false });

      if (searchPlaceTerm) {
        query.ilike('name', `%${searchPlaceTerm}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    }
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <div className="flex-1 mr-4">
          <Input
            type="text"
            placeholder="Buscar lugares..."
            value={searchPlaceTerm}
            onChange={(e) => setSearchPlaceTerm(e.target.value)}
            className="w-full"
          />
        </div>
        <Button className="whitespace-nowrap">
          Novo Lugar
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {places?.map((place) => (
          <Card key={place.id}>
            <CardHeader>
              <CardTitle>{place.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500">{place.address}</p>
              <p className="mt-2 line-clamp-3">{place.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default PlacesTab;
