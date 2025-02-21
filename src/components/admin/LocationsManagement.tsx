
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Location } from "@/types/locations";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { format } from "date-fns";
import { MoreVertical, Edit, Trash2, Plus } from "lucide-react";

const LocationsManagement = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showLocationDialog, setShowLocationDialog] = useState(false);
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);
  const [newLocation, setNewLocation] = useState({
    name: "",
    state: "",
  });

  const { data: locations, isLoading } = useQuery({
    queryKey: ["locations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("locations")
        .select("*")
        .order("name", { ascending: true });
      
      if (error) throw error;
      return data as Location[];
    },
  });

  const addLocationMutation = useMutation({
    mutationFn: async (location: Omit<Location, "id" | "created_at">) => {
      const { data, error } = await supabase
        .from('locations')
        .insert(location)
        .select()
        .single();

      if (error) throw error;
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
    onError: (error) => {
      toast({
        title: "Erro ao adicionar localização",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateLocationMutation = useMutation({
    mutationFn: async (location: Location) => {
      const { data, error } = await supabase
        .from("locations")
        .update({
          name: location.name,
          state: location.state,
        })
        .eq("id", location.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["locations"] });
      setShowLocationDialog(false);
      setEditingLocation(null);
      toast({
        title: "Localização atualizada",
        description: "A localização foi atualizada com sucesso",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao atualizar localização",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteLocationMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("locations")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["locations"] });
      toast({
        title: "Localização excluída",
        description: "A localização foi excluída com sucesso",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao excluir localização",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleLocationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingLocation) {
      updateLocationMutation.mutate({
        ...editingLocation,
        ...newLocation,
      });
    } else {
      addLocationMutation.mutate(newLocation);
    }
  };

  if (isLoading) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="mt-10">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Localizações</h2>
        <Dialog open={showLocationDialog} onOpenChange={setShowLocationDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Localização
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingLocation ? "Editar" : "Adicionar"} Localização
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleLocationSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium">Nome da Cidade</label>
                <Input
                  value={newLocation.name}
                  onChange={(e) =>
                    setNewLocation({ ...newLocation, name: e.target.value })
                  }
                  placeholder="Nome da cidade"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium">Estado</label>
                <Input
                  value={newLocation.state}
                  onChange={(e) =>
                    setNewLocation({ ...newLocation, state: e.target.value })
                  }
                  placeholder="Estado (UF)"
                  required
                />
              </div>
              <Button type="submit" className="w-full">
                {editingLocation ? "Atualizar" : "Adicionar"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-white rounded-lg shadow">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Cidade</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Criado em</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {locations?.map((location) => (
              <TableRow key={location.id}>
                <TableCell className="font-medium">{location.name}</TableCell>
                <TableCell>{location.state}</TableCell>
                <TableCell>
                  {format(new Date(location.created_at), "dd/MM/yyyy")}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => {
                          setEditingLocation(location);
                          setNewLocation({
                            name: location.name,
                            state: location.state,
                          });
                          setShowLocationDialog(true);
                        }}
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-red-600"
                        onClick={() => {
                          if (window.confirm("Tem certeza que deseja excluir esta localização?")) {
                            deleteLocationMutation.mutate(location.id);
                          }
                        }}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default LocationsManagement;
