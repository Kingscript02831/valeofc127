
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";

const generateSlug = (name: string): string => {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
};

const AdminCategories = () => {
  const { toast } = useToast();
  const [newCategory, setNewCategory] = useState({
    name: "",
    background_color: "#000000",
    page_type: "events",
    parent_id: null,
    slug: "",
    description: "",
    updated_at: new Date().toISOString()
  });

  const { data: categories, refetch } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("name");
      if (error) throw error;
      return data;
    },
  });

  const handleNameChange = (value: string) => {
    setNewCategory({
      ...newCategory,
      name: value,
      slug: generateSlug(value)
    });
  };

  const handleAddCategory = async () => {
    try {
      if (!newCategory.name) {
        toast({
          variant: "destructive",
          title: "Nome da categoria é obrigatório",
          description: "Por favor, insira um nome para a categoria.",
        });
        return;
      }

      console.log("Trying to add category:", newCategory); // Debug log

      const { data, error } = await supabase
        .from("categories")
        .insert([{
          name: newCategory.name,
          background_color: newCategory.background_color,
          page_type: newCategory.page_type,
          parent_id: newCategory.parent_id,
          slug: generateSlug(newCategory.name),
          description: newCategory.description,
          updated_at: new Date().toISOString()
        }])
        .select();

      if (error) {
        console.error("Supabase error:", error); // Debug log
        toast({
          variant: "destructive",
          title: "Erro ao adicionar categoria",
          description: error.message || "Ocorreu um erro ao adicionar a categoria. Tente novamente.",
        });
        return;
      }

      toast({
        title: "Categoria adicionada com sucesso!",
        description: `A categoria "${newCategory.name}" foi adicionada.`,
      });

      setNewCategory({
        name: "",
        background_color: "#000000",
        page_type: "events",
        parent_id: null,
        slug: "",
        description: "",
        updated_at: new Date().toISOString()
      });

      refetch();
    } catch (error) {
      console.error("Error adding category:", error);
      toast({
        variant: "destructive",
        title: "Erro ao adicionar categoria",
        description: "Ocorreu um erro ao adicionar a categoria. Tente novamente.",
      });
    }
  };

  const handleDeleteCategory = async (id: string) => {
    try {
      const { error } = await supabase
        .from("categories")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Categoria excluída com sucesso!",
        description: "A categoria foi removida.",
      });

      refetch();
    } catch (error) {
      console.error("Error deleting category:", error);
      toast({
        variant: "destructive",
        title: "Erro ao excluir categoria",
        description: "Ocorreu um erro ao excluir a categoria. Tente novamente.",
      });
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">Gerenciar Categorias</h1>

      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Adicionar Nova Categoria</h2>
        <div className="space-y-4">
          <div>
            <Label htmlFor="name">Nome da Categoria</Label>
            <Input
              id="name"
              value={newCategory.name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="Digite o nome da categoria"
            />
          </div>

          <div>
            <Label htmlFor="description">Descrição</Label>
            <Input
              id="description"
              value={newCategory.description}
              onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
              placeholder="Digite uma descrição para a categoria"
            />
          </div>

          <div>
            <Label htmlFor="page_type">Tipo de Página</Label>
            <Select
              value={newCategory.page_type}
              onValueChange={(value) => 
                setNewCategory({ ...newCategory, page_type: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="events">Eventos</SelectItem>
                <SelectItem value="places">Lugares</SelectItem>
                <SelectItem value="news">Notícias</SelectItem>
                <SelectItem value="products">Produtos</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="background_color">Cor de Fundo</Label>
            <div className="flex gap-2">
              <Input
                id="background_color"
                type="color"
                value={newCategory.background_color}
                onChange={(e) => setNewCategory({ ...newCategory, background_color: e.target.value })}
                className="w-16"
              />
              <Input
                value={newCategory.background_color}
                onChange={(e) => setNewCategory({ ...newCategory, background_color: e.target.value })}
                placeholder="#000000"
              />
            </div>
          </div>

          <Button onClick={handleAddCategory}>
            Adicionar Categoria
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Categorias Existentes</h2>
        <div className="space-y-4">
          {categories?.map((category) => (
            <div
              key={category.id}
              className="flex items-center justify-between p-4 border rounded-lg"
            >
              <div className="flex items-center gap-4">
                <div
                  className="w-6 h-6 rounded"
                  style={{ backgroundColor: category.background_color }}
                />
                <div>
                  <p className="font-medium">{category.name}</p>
                  <p className="text-sm text-gray-500">
                    {category.page_type === "events" && "Eventos"}
                    {category.page_type === "places" && "Lugares"}
                    {category.page_type === "news" && "Notícias"}
                    {category.page_type === "products" && "Produtos"}
                  </p>
                  {category.description && (
                    <p className="text-sm text-gray-500">{category.description}</p>
                  )}
                </div>
              </div>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleDeleteCategory(category.id)}
              >
                Excluir
              </Button>
            </div>
          ))}
          {!categories?.length && (
            <p className="text-center text-gray-500">
              Nenhuma categoria cadastrada.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminCategories;
