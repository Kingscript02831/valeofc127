
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { PlusCircle, Pencil, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { Database } from "../integrations/supabase/types";
import { supabase } from "../integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import Navbar from "../components/Navbar";
import SubNav from "../components/SubNav";
import Footer from "../components/Footer";

type Store = Database["public"]["Tables"]["stores"]["Row"];

const AdminStores = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentStore, setCurrentStore] = useState<Store | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  
  const { data: stores, isLoading, refetch } = useQuery({
    queryKey: ["admin-stores", searchTerm],
    queryFn: async () => {
      let query = supabase
        .from("stores")
        .select("*")
        .order("name");

      if (searchTerm) {
        query = query.ilike("name", `%${searchTerm}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  const handleSave = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    
    const storeData = {
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      address: formData.get("address") as string,
      owner_name: formData.get("owner_name") as string,
      phone: formData.get("phone") as string,
      whatsapp: formData.get("whatsapp") as string,
      website: formData.get("website") as string,
      opening_hours: formData.get("opening_hours") as string,
      maps_url: formData.get("maps_url") as string,
      social_media: {
        facebook: formData.get("facebook") as string,
        instagram: formData.get("instagram") as string,
      },
    };

    try {
      if (currentStore) {
        await supabase
          .from("stores")
          .update(storeData)
          .eq("id", currentStore.id);
        toast.success("Loja atualizada com sucesso!");
      } else {
        await supabase
          .from("stores")
          .insert([storeData]);
        toast.success("Loja criada com sucesso!");
      }
      
      setIsDialogOpen(false);
      setCurrentStore(null);
      refetch();
    } catch (error) {
      toast.error("Erro ao salvar a loja. Tente novamente.");
    }
  };

  const handleDelete = async (store: Store) => {
    if (window.confirm("Tem certeza que deseja excluir esta loja?")) {
      try {
        await supabase
          .from("stores")
          .delete()
          .eq("id", store.id);
        toast.success("Loja excluída com sucesso!");
        refetch();
      } catch (error) {
        toast.error("Erro ao excluir a loja. Tente novamente.");
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <SubNav />
      <main className="flex-1 container mx-auto py-8 px-4">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Gerenciar Lojas</h1>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button
                onClick={() => setCurrentStore(null)}
                className="flex items-center gap-2"
              >
                <PlusCircle className="w-4 h-4" />
                Nova Loja
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {currentStore ? "Editar Loja" : "Nova Loja"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSave} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome</Label>
                    <Input
                      id="name"
                      name="name"
                      defaultValue={currentStore?.name}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="owner_name">Proprietário</Label>
                    <Input
                      id="owner_name"
                      name="owner_name"
                      defaultValue={currentStore?.owner_name || ""}
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="description">Descrição</Label>
                    <Textarea
                      id="description"
                      name="description"
                      defaultValue={currentStore?.description || ""}
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="address">Endereço</Label>
                    <Input
                      id="address"
                      name="address"
                      defaultValue={currentStore?.address}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefone</Label>
                    <Input
                      id="phone"
                      name="phone"
                      defaultValue={currentStore?.phone || ""}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="whatsapp">WhatsApp</Label>
                    <Input
                      id="whatsapp"
                      name="whatsapp"
                      defaultValue={currentStore?.whatsapp || ""}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      name="website"
                      defaultValue={currentStore?.website || ""}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="opening_hours">Horário de Funcionamento</Label>
                    <Input
                      id="opening_hours"
                      name="opening_hours"
                      defaultValue={currentStore?.opening_hours || ""}
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="maps_url">Link do Google Maps</Label>
                    <Input
                      id="maps_url"
                      name="maps_url"
                      defaultValue={currentStore?.maps_url || ""}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="facebook">Facebook</Label>
                    <Input
                      id="facebook"
                      name="facebook"
                      defaultValue={currentStore?.social_media?.facebook || ""}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="instagram">Instagram</Label>
                    <Input
                      id="instagram"
                      name="instagram"
                      defaultValue={currentStore?.social_media?.instagram || ""}
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit">Salvar</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="mb-6">
          <Input
            type="search"
            placeholder="Buscar lojas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stores?.map((store) => (
              <Card key={store.id}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold">{store.name}</h3>
                      {store.owner_name && (
                        <p className="text-sm text-gray-500">{store.owner_name}</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => {
                          setCurrentStore(store);
                          setIsDialogOpen(true);
                        }}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleDelete(store)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{store.address}</p>
                  {store.description && (
                    <p className="text-sm text-gray-500 line-clamp-2 mb-2">
                      {store.description}
                    </p>
                  )}
                  {store.opening_hours && (
                    <p className="text-sm text-gray-500">
                      Horário: {store.opening_hours}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
            {!isLoading && (!stores || stores.length === 0) && (
              <p className="text-gray-500 col-span-full text-center py-8">
                Nenhuma loja encontrada.
              </p>
            )}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default AdminStores;
