
import { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "../../integrations/supabase/client";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { StoreFormData, Store } from "../../types/stores";
import type { Database } from "../../types/supabase";

type Category = Database['public']['Tables']['categories']['Row'];

interface StoreFormProps {
  initialData?: Store;
  onSubmit: (data: StoreFormData) => void;
  onCancel: () => void;
}

export const StoreForm = ({ initialData, onSubmit, onCancel }: StoreFormProps) => {
  const [formData, setFormData] = useState<StoreFormData>({
    name: "",
    description: "",
    address: "",
    city: "",
    state: "",
    postal_code: "",
    owner_name: "",
    opening_hours: "",
    entrance_fee: "",
    maps_url: "",
    phone: "",
    whatsapp: "",
    website: "",
    image: "",
    images: [],
    video_urls: [],
    category_id: "",
    social_media: {
      facebook: "",
      instagram: "",
    },
  });

  const [categories, setCategories] = useState<Category[]>([]);
  const [newImageUrl, setNewImageUrl] = useState("");
  const [newVideoUrl, setNewVideoUrl] = useState("");

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        description: initialData.description,
        address: initialData.address,
        city: initialData.city || "",
        state: initialData.state || "",
        postal_code: initialData.postal_code || "",
        owner_name: initialData.owner_name || "",
        opening_hours: initialData.opening_hours || "",
        entrance_fee: initialData.entrance_fee || "",
        maps_url: initialData.maps_url || "",
        phone: initialData.phone || "",
        whatsapp: initialData.whatsapp || "",
        website: initialData.website || "",
        image: initialData.image || "",
        images: initialData.images || [],
        video_urls: initialData.video_urls || [],
        category_id: initialData.category_id || "",
        social_media: initialData.social_media || {
          facebook: "",
          instagram: "",
        },
      });
    }
  }, [initialData]);

  useEffect(() => {
    const fetchCategories = async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .eq("page_type", "stores");

      if (!error && data) {
        setCategories(data);
      }
    };

    fetchCategories();
  }, []);

  const handleAddImage = () => {
    if (!newImageUrl) {
      toast.error("Por favor, insira uma URL de imagem válida");
      return;
    }

    if (!newImageUrl.includes('dropbox.com')) {
      toast.error("Por favor, insira uma URL válida do Dropbox");
      return;
    }

    let directImageUrl = newImageUrl;
    if (newImageUrl.includes('www.dropbox.com')) {
      directImageUrl = newImageUrl.replace('www.dropbox.com', 'dl.dropboxusercontent.com');
    }

    if (!formData.images?.includes(directImageUrl)) {
      setFormData({
        ...formData,
        images: [...(formData.images || []), directImageUrl]
      });
      setNewImageUrl("");
      toast.success("Imagem adicionada com sucesso!");
    } else {
      toast.error("Esta imagem já foi adicionada");
    }
  };

  const handleRemoveImage = (imageUrl: string) => {
    setFormData({
      ...formData,
      images: formData.images?.filter(url => url !== imageUrl) || []
    });
    toast.success("Imagem removida com sucesso!");
  };

  const handleAddVideo = () => {
    if (!newVideoUrl) {
      toast.error("Por favor, insira uma URL de vídeo válida");
      return;
    }

    const isDropboxUrl = newVideoUrl.includes('dropbox.com');
    const isYoutubeUrl = newVideoUrl.includes('youtube.com') || newVideoUrl.includes('youtu.be');

    if (!isDropboxUrl && !isYoutubeUrl) {
      toast.error("Por favor, insira uma URL válida do Dropbox ou YouTube");
      return;
    }

    let directVideoUrl = newVideoUrl;
    if (isDropboxUrl && newVideoUrl.includes('www.dropbox.com')) {
      directVideoUrl = newVideoUrl.replace('www.dropbox.com', 'dl.dropboxusercontent.com');
    }

    if (!formData.video_urls?.includes(directVideoUrl)) {
      setFormData({
        ...formData,
        video_urls: [...(formData.video_urls || []), directVideoUrl]
      });
      setNewVideoUrl("");
      toast.success("Vídeo adicionado com sucesso!");
    } else {
      toast.error("Este vídeo já foi adicionado");
    }
  };

  const handleRemoveVideo = (videoUrl: string) => {
    setFormData({
      ...formData,
      video_urls: formData.video_urls?.filter(url => url !== videoUrl) || []
    });
    toast.success("Vídeo removido com sucesso!");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Nome *</Label>
          <Input
            id="name"
            name="name"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="category">Categoria</Label>
          <Select
            value={formData.category_id}
            onValueChange={(value) => setFormData(prev => ({ ...prev, category_id: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione uma categoria" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="address">Endereço *</Label>
          <Input
            id="address"
            name="address"
            value={formData.address}
            onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="city">Cidade</Label>
          <Input
            id="city"
            name="city"
            value={formData.city || ""}
            onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="state">Estado</Label>
          <Input
            id="state"
            name="state"
            value={formData.state || ""}
            onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="postal_code">CEP</Label>
          <Input
            id="postal_code"
            name="postal_code"
            value={formData.postal_code || ""}
            onChange={(e) => setFormData(prev => ({ ...prev, postal_code: e.target.value }))}
          />
        </div>

        <div className="space-y-2 col-span-2">
          <Label htmlFor="description">Descrição *</Label>
          <Textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            required
          />
        </div>

        {/* Seção de Imagens do Dropbox */}
        <div className="col-span-2 space-y-2">
          <Label>Imagens do Dropbox</Label>
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input
                value={newImageUrl}
                onChange={(e) => setNewImageUrl(e.target.value)}
                placeholder="Cole a URL compartilhada do Dropbox"
              />
              <Button type="button" onClick={handleAddImage}>
                <Plus className="w-4 h-4 mr-2" />
                Adicionar
              </Button>
            </div>
            <div className="grid grid-cols-1 gap-2">
              {formData.images?.map((url, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input value={url} readOnly />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    onClick={() => handleRemoveImage(url)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Seção de Vídeos */}
        <div className="col-span-2 space-y-2">
          <Label>Vídeos (Dropbox ou YouTube)</Label>
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input
                value={newVideoUrl}
                onChange={(e) => setNewVideoUrl(e.target.value)}
                placeholder="Cole a URL do Dropbox ou YouTube"
              />
              <Button type="button" onClick={handleAddVideo}>
                <Plus className="w-4 h-4 mr-2" />
                Adicionar
              </Button>
            </div>
            <div className="grid grid-cols-1 gap-2">
              {formData.video_urls?.map((url, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input value={url} readOnly />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    onClick={() => handleRemoveVideo(url)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="owner_name">Nome do Proprietário</Label>
          <Input
            id="owner_name"
            name="owner_name"
            value={formData.owner_name || ""}
            onChange={(e) => setFormData(prev => ({ ...prev, owner_name: e.target.value }))}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="opening_hours">Horário de Funcionamento</Label>
          <Input
            id="opening_hours"
            name="opening_hours"
            value={formData.opening_hours || ""}
            onChange={(e) => setFormData(prev => ({ ...prev, opening_hours: e.target.value }))}
            placeholder="Ex: Segunda a Sexta 9h às 18h"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="entrance_fee">Valor da Entrada</Label>
          <Input
            id="entrance_fee"
            name="entrance_fee"
            value={formData.entrance_fee || ""}
            onChange={(e) => setFormData(prev => ({ ...prev, entrance_fee: e.target.value }))}
            placeholder="Ex: R$ 20,00"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="maps_url">Link do Google Maps</Label>
          <Input
            id="maps_url"
            name="maps_url"
            value={formData.maps_url || ""}
            onChange={(e) => setFormData(prev => ({ ...prev, maps_url: e.target.value }))}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Telefone</Label>
          <Input
            id="phone"
            name="phone"
            value={formData.phone || ""}
            onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="whatsapp">WhatsApp</Label>
          <Input
            id="whatsapp"
            name="whatsapp"
            value={formData.whatsapp || ""}
            onChange={(e) => setFormData(prev => ({ ...prev, whatsapp: e.target.value }))}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="website">Website</Label>
          <Input
            id="website"
            name="website"
            value={formData.website || ""}
            onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="image">URL da Imagem</Label>
          <Input
            id="image"
            name="image"
            value={formData.image || ""}
            onChange={(e) => setFormData(prev => ({ ...prev, image: e.target.value }))}
          />
        </div>

        {/* Redes Sociais */}
        <div className="space-y-2">
          <Label htmlFor="social_media.facebook">Facebook</Label>
          <Input
            id="social_media.facebook"
            name="social_media.facebook"
            value={formData.social_media?.facebook || ""}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              social_media: {
                ...prev.social_media,
                facebook: e.target.value
              }
            }))}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="social_media.instagram">Instagram</Label>
          <Input
            id="social_media.instagram"
            name="social_media.instagram"
            value={formData.social_media?.instagram || ""}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              social_media: {
                ...prev.social_media,
                instagram: e.target.value
              }
            }))}
          />
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
