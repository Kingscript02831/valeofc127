
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Edit, Trash, Plus, Search } from "lucide-react";
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
import type { Database } from "@/integrations/supabase/types";

type Category = Database['public']['Tables']['categories']['Row'];

const AdminPlaces = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [isAddEditDialogOpen, setIsAddEditDialogOpen] = useState(false);

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

  // Fetch categories
  const { data: categories } = useQuery({
    queryKey: ["categories-places"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .eq('page_type', 'places')
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

      if (selectedPlace) {
        // Update existing place
        const { error } = await supabase
          .from("places")
          .update(formData)
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
          .insert({ ...formData, user_id: user.id });

        if (error) throw error;
        toast({
          title: "Local adicionado com sucesso!",
          variant: "default",
        });
      }

      queryClient.invalidateQueries({ queryKey: ["admin-places"] });
      setIsAddEditDialogOpen(false);
      setSelectedPlace(null);
    } catch (error) {
      console.error("Error saving place:", error);
      toast({
        title: "Erro ao salvar o local",
        description: "Por favor, tente novamente.",
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
              categories={categories || []}
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
                    Cidade
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
                  <tr key={place.id} className="border-b hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">{place.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {place.address}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {place.city}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {place.phone || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
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
