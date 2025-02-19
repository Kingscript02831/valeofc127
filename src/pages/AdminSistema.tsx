
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Location, LocationInput } from "@/types/locations";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const AdminSistema = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showLocationDialog, setShowLocationDialog] = useState(false);
  const [newLocation, setNewLocation] = useState<LocationInput>({
    name: "",
    state: "",
  });

  const { data: locations, isLoading } = useQuery({
    queryKey: ["locations"],
    queryFn: async () => {
      console.log("Fetching locations...");
      const { data, error } = await supabase
        .from("locations")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching locations:", error);
        throw error;
      }

      console.log("Locations fetched:", data);
      return data as Location[];
    },
  });

  const addLocationMutation = useMutation({
    mutationFn: async (locationData: LocationInput) => {
      console.log("Attempting to add location:", locationData);
      const { data, error } = await supabase
        .from("locations")
        .insert([locationData])
        .select()
        .single();

      if (error) {
        console.error("Supabase error:", error);
        throw error;
      }

      console.log("Location added successfully:", data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["locations"] });
      setShowLocationDialog(false);
      setNewLocation({ name: "", state: "" });
      toast({
        title: "Localização adicionada",
        description: "A localização foi adicionada com sucesso",
      });
    },
    onError: (error: any) => {
      console.error("Mutation error:", error);
      toast({
        title: "Erro ao adicionar localização",
        description: error.message || "Ocorreu um erro ao adicionar a localização",
        variant: "destructive",
      });
    },
  });

  const handleAddLocation = () => {
    if (!newLocation.name || !newLocation.state) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos",
        variant: "destructive",
      });
      return;
    }

    addLocationMutation.mutate(newLocation);
  };

  if (isLoading) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <div className="mb-6">
        <Dialog open={showLocationDialog} onOpenChange={setShowLocationDialog}>
          <DialogTrigger asChild>
            <Button>Adicionar Localização</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adicionar Nova Localização</DialogTitle>
              <DialogDescription>
                Preencha os dados da nova localização
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="locationName">Nome</Label>
                <Input
                  id="locationName"
                  value={newLocation.name}
                  onChange={(e) =>
                    setNewLocation({ ...newLocation, name: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="locationState">Estado</Label>
                <Input
                  id="locationState"
                  value={newLocation.state}
                  onChange={(e) =>
                    setNewLocation({ ...newLocation, state: e.target.value })
                  }
                />
              </div>
              <Button onClick={handleAddLocation}>Salvar</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {locations?.map((location) => (
          <div
            key={location.id}
            className="p-4 border rounded-lg shadow-sm bg-white"
          >
            <h3 className="font-semibold">{location.name}</h3>
            <p className="text-gray-600">{location.state}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminSistema;
