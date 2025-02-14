
import { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { FileUpload } from "./FileUpload";
import type { NewsFormData, News } from "../../types/news";

interface NewsFormProps {
  initialData?: News;
  onSubmit: (data: NewsFormData) => void;
  onCancel: () => void;
  categories?: { id: string; name: string }[];
}

export const NewsForm = ({ initialData, onSubmit, onCancel, categories }: NewsFormProps) => {
  const [formData, setFormData] = useState<NewsFormData>({
    title: "",
    content: "",
    file_path: "",
    video: "",
    button_color: "#9b87f5",
    button_secondary_color: "#7E69AB",
    category_id: "",
    instagram_media: [],
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title,
        content: initialData.content,
        file_path: initialData.file_path || "",
        video: initialData.video || "",
        button_color: initialData.button_color || "#9b87f5",
        button_secondary_color: initialData.button_secondary_color || "#7E69AB",
        category_id: initialData.category_id || "",
        instagram_media: initialData.instagram_media as any || [],
      });
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2 col-span-2">
          <Label htmlFor="title">Título *</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            required
          />
        </div>

        <div className="space-y-2 col-span-2">
          <Label htmlFor="content">Conteúdo *</Label>
          <Textarea
            id="content"
            value={formData.content}
            onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
            className="min-h-[200px]"
            required
          />
        </div>

        <div className="space-y-2 col-span-2">
          <Label>Imagem</Label>
          <FileUpload
            accept="image/*"
            currentValue={formData.file_path || ""}
            onFileSelect={(url) => setFormData(prev => ({ ...prev, file_path: url }))}
            buttonText="Upload de Imagem"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="video">Link do Vídeo</Label>
          <Input
            id="video"
            value={formData.video || ""}
            onChange={(e) => setFormData(prev => ({ ...prev, video: e.target.value }))}
            placeholder="URL do vídeo"
          />
        </div>

        {categories && (
          <div className="space-y-2">
            <Label htmlFor="category">Categoria</Label>
            <select
              id="category"
              className="w-full border border-gray-300 rounded-md p-2"
              value={formData.category_id || ""}
              onChange={(e) => setFormData(prev => ({ ...prev, category_id: e.target.value }))}
            >
              <option value="">Selecione uma categoria</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="button_color">Cor do Botão</Label>
          <div className="flex gap-2">
            <Input
              type="color"
              id="button_color"
              value={formData.button_color || "#9b87f5"}
              onChange={(e) => setFormData(prev => ({ ...prev, button_color: e.target.value }))}
              className="w-20"
            />
            <Input
              type="text"
              value={formData.button_color || "#9b87f5"}
              onChange={(e) => setFormData(prev => ({ ...prev, button_color: e.target.value }))}
              placeholder="#9b87f5"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="button_secondary_color">Cor Secundária do Botão</Label>
          <div className="flex gap-2">
            <Input
              type="color"
              id="button_secondary_color"
              value={formData.button_secondary_color || "#7E69AB"}
              onChange={(e) => setFormData(prev => ({ ...prev, button_secondary_color: e.target.value }))}
              className="w-20"
            />
            <Input
              type="text"
              value={formData.button_secondary_color || "#7E69AB"}
              onChange={(e) => setFormData(prev => ({ ...prev, button_secondary_color: e.target.value }))}
              placeholder="#7E69AB"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
        >
          Cancelar
        </Button>
        <Button type="submit">
          {initialData ? "Salvar" : "Adicionar"}
        </Button>
      </div>
    </form>
  );
};
