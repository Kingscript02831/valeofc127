
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import PlaceForm from "./PlaceForm";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Loader2, MapPin, Phone, Globe, Instagram, Facebook } from "lucide-react";
import { toast } from "sonner";

interface PlacesTabProps {
  searchPlaceTerm: string;
  setSearchPlaceTerm: (term: string) => void;
}

export default function PlacesTab({ searchPlaceTerm, setSearchPlaceTerm }: PlacesTabProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState<any>(null);

  const { data: places, isLoading } = useQuery({
    queryKey: ["places"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("places")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        toast.error("Erro ao carregar lugares");
        throw error;
      }

      return data;
    },
  });

  const filteredPlaces = places?.filter((place) =>
    place.name.toLowerCase().includes(searchPlaceTerm.toLowerCase())
  );

  const handleEdit = (place: any) => {
    setSelectedPlace(place);
    setIsDialogOpen(true);
  };

  const handleCreate = () => {
    setSelectedPlace(null);
    setIsDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Input
          placeholder="Buscar lugares..."
          value={searchPlaceTerm}
          onChange={(e) => setSearchPlaceTerm(e.target.value)}
          className="max-w-sm"
        />
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleCreate}>Adicionar Lugar</Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {selectedPlace ? "Editar Lugar" : "Adicionar Lugar"}
              </DialogTitle>
            </DialogHeader>
            <PlaceForm
              place={selectedPlace}
              onSuccess={() => setIsDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {filteredPlaces?.map((place) => (
          <div
            key={place.id}
            className="border rounded-lg p-4 space-y-4 bg-white shadow-sm"
          >
            {place.image && (
              <img
                src={place.image}
                alt={place.name}
                className="w-full h-48 object-cover rounded-md"
              />
            )}
            <h3 className="text-xl font-semibold">{place.name}</h3>
            
            <div className="space-y-2 text-gray-600">
              {place.address && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <a
                    href={place.maps_url || `https://www.google.com/maps/search/${encodeURIComponent(place.address)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline"
                  >
                    {place.address}
                  </a>
                </div>
              )}
              
              {place.owner_name && (
                <p>Proprietário: {place.owner_name}</p>
              )}
              
              {place.opening_hours && (
                <p>Horário: {place.opening_hours}</p>
              )}
              
              {place.entrance_fee && (
                <p>Entrada: {place.entrance_fee}</p>
              )}
              
              {(place.phone || place.whatsapp) && (
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  <div>
                    {place.phone && <p>Tel: {place.phone}</p>}
                    {place.whatsapp && (
                      <a
                        href={`https://wa.me/${place.whatsapp.replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:underline"
                      >
                        WhatsApp: {place.whatsapp}
                      </a>
                    )}
                  </div>
                </div>
              )}
              
              <div className="flex gap-2 pt-2">
                {place.website && (
                  <a
                    href={place.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-gray-800"
                  >
                    <Globe className="w-5 h-5" />
                  </a>
                )}
                {place.social_media?.instagram && (
                  <a
                    href={`https://instagram.com/${place.social_media.instagram}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-gray-800"
                  >
                    <Instagram className="w-5 h-5" />
                  </a>
                )}
                {place.social_media?.facebook && (
                  <a
                    href={place.social_media.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-gray-800"
                  >
                    <Facebook className="w-5 h-5" />
                  </a>
                )}
              </div>
            </div>

            <Button variant="outline" onClick={() => handleEdit(place)}>
              Editar
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
