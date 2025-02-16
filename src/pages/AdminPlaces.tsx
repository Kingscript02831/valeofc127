import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Edit, Trash, Plus, Search, ChevronDown, ChevronUp } from "lucide-react";
import { useToast } from "../hooks/use-toast";
import { supabase } from "../integrations/supabase/client";
import { Button } from "../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../components/ui/alert-dialog";
import { PlaceForm } from "../components/admin/PlaceForm";
import type { Place, PlaceFormData } from "../types/places";
import { cn } from "../lib/utils";

const AdminPlaces = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [isAddEditDialogOpen, setIsAddEditDialogOpen] = useState(false);
  const [expandedPlaces, setExpandedPlaces] = useState<Record<string, boolean>>({});

  const toggleExpand = (placeId: string) => {
    setExpandedPlaces(prev => ({
      ...prev,
      [placeId]: !prev[placeId]
    }));
  };

  // Fetch places
  const { data: places, isLoading } = useQuery({
    queryKey: ["admin-places"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("places")
        .select("*")
        .order("name");

      if (error) throw error;
      return data;
    },
  });

  // Filter places based on search term
  const filteredPlaces = places?.filter((place) =>
    place.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle form submission
  const handleSubmit = async (formData: PlaceFormData) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Erro ao salvar o local",
          description: "Você precisa estar logado para realizar esta ação.",
          variant: "destructive",
        });
        return;
      }

      // Remove any undefined values from the formData
      const cleanFormData = Object.fromEntries(
        Object.entries(formData).filter(([_, v]) => v !== undefined)
      );

      // Remove empty arrays if they exist
      if (Array.isArray(cleanFormData.images) && cleanFormData.images.length === 0) {
        delete cleanFormData.images;
      }
      if (Array.isArray(cleanFormData.video_urls) && cleanFormData.video_urls.length === 0) {
        delete cleanFormData.video_urls;
      }

      // Ensure required fields are present
      const finalPlaceData = {
        ...cleanFormData,
        user_id: user.id,
        name: formData.name,
        description: formData.description,
        address: formData.address,
        // Convert empty strings to null for optional fields
        owner_name: formData.owner_name || null,
        opening_hours: formData.opening_hours || null,
        entrance_fee: formData.entrance_fee || null,
        maps_url: formData.maps_url || null,
        phone: formData.phone || null,
        whatsapp: formData.whatsapp || null,
        website: formData.website || null,
        image: formData.image || null,
        category_id: formData.category_id || null,
        social_media: formData.social_media || null
      };

      if (selectedPlace) {
        // Update existing place
        const { error } = await supabase
          .from("places")
          .update(finalPlaceData)
          .eq("id", selectedPlace.id);

        if (error) throw error;
        toast({
          title: "Local atualizado com sucesso!",
          variant: "default",
        });
      } else {
        // Add new place
        const { error } = await supabase
          .from("places")
          .insert(finalPlaceData);

        if (error) throw error;
        toast({
          title: "Local adicionado com sucesso!",
          variant: "default",
        });
      }

      queryClient.invalidateQueries({ queryKey: ["admin-places"] });
      setIsAddEditDialogOpen(false);
      setSelectedPlace(null);
    } catch (error: any) {
      console.error("Error saving place:", error);
      toast({
        title: "Erro ao salvar o local",
        description: error.message || "Por favor, tente novamente.",
        variant: "destructive",
      });
    }
  };

  // Handle place deletion
  const handleDelete = async () => {
    if (!selectedPlace) return;

    try {
      const { error } = await supabase
        .from("places")
        .delete()
        .eq("id", selectedPlace.id);

      if (error) throw error;

      toast({
        title: "Local excluído com sucesso!",
        variant: "default",
      });

      queryClient.invalidateQueries({ queryKey: ["admin-places"] });
      setIsDeleteDialogOpen(false);
      setSelectedPlace(null);
    } catch (error) {
      console.error("Error deleting place:", error);
      toast({
        title: "Erro ao excluir o local",
        description: "Por favor, tente novamente.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gerenciar Lugares</h1>
        <Dialog open={isAddEditDialogOpen} onOpenChange={setIsAddEditDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                setSelectedPlace(null);
                setIsAddEditDialogOpen(true);
              }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Local
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {selectedPlace ? "Editar Local" : "Adicionar Novo Local"}
              </DialogTitle>
            </DialogHeader>
            <PlaceForm
              initialData={selectedPlace || undefined}
              onSubmit={handleSubmit}
              onCancel={() => setIsAddEditDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            className="pl-10"
            placeholder="Pesquisar lugares..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nome
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Endereço
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Telefone
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredPlaces?.map((place) => (
                  <>
                    <tr key={place.id} className="border-b hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">{place.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {place.address}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {place.phone || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleExpand(place.id)}
                          className="mr-2"
                        >
                          {expandedPlaces[place.id] ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedPlace(place);
                            setIsAddEditDialogOpen(true);
                          }}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedPlace(place);
                            setIsDeleteDialogOpen(true);
                          }}
                        >
                          <Trash className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                    {expandedPlaces[place.id] && (
                      <tr className="bg-gray-50">
                        <td colSpan={4} className="px-6 py-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <h4 className="font-semibold mb-2">Descrição:</h4>
                              <p className="text-sm text-gray-600">{place.description}</p>
                            </div>
                            <div>
                              <h4 className="font-semibold mb-2">Informações Adicionais:</h4>
                              <div className="space-y-2 text-sm text-gray-600">
                                {place.owner_name && (
                                  <p><span className="font-medium">Proprietário:</span> {place.owner_name}</p>
                                )}
                                {place.opening_hours && (
                                  <p><span className="font-medium">Horário de Funcionamento:</span> {place.opening_hours}</p>
                                )}
                                {place.entrance_fee && (
                                  <p><span className="font-medium">Taxa de Entrada:</span> {place.entrance_fee}</p>
                                )}
                                {place.whatsapp && (
                                  <p><span className="font-medium">WhatsApp:</span> {place.whatsapp}</p>
                                )}
                                {place.website && (
                                  <p><span className="font-medium">Website:</span> {place.website}</p>
                                )}
                                {place.maps_url && (
                                  <p>
                                    <span className="font-medium">Maps:</span>{" "}
                                    <a 
                                      href={place.maps_url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-blue-600 hover:underline"
                                    >
                                      Ver no Google Maps
                                    </a>
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este local? Esta ação não pode ser
              desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsDeleteDialogOpen(false)}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminPlaces;
