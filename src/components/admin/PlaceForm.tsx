
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface PlaceFormProps {
  place?: any;
  onSuccess?: () => void;
}

export default function PlaceForm({ place, onSuccess }: PlaceFormProps) {
  const queryClient = useQueryClient();
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    name: place?.name || "",
    description: place?.description || "",
    address: place?.address || "",
    maps_url: place?.maps_url || "",
    owner_name: place?.owner_name || "",
    opening_hours: place?.opening_hours || "",
    entrance_fee: place?.entrance_fee || "",
    phone: place?.phone || "",
    whatsapp: place?.whatsapp || "",
    website: place?.website || "",
    image: place?.image || "",
    social_media: place?.social_media || { instagram: "", facebook: "" },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name.startsWith("social_media.")) {
      const socialKey = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        social_media: {
          ...prev.social_media,
          [socialKey]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (!e.target.files || e.target.files.length === 0) return;
      
      setUploading(true);
      const file = e.target.files[0];
      const fileExt = file.name.split(".").pop();
      const filePath = `${crypto.randomUUID()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("places")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("places")
        .getPublicUrl(filePath);

      setFormData((prev) => ({
        ...prev,
        image: publicUrl,
      }));

      toast.success("Imagem carregada com sucesso!");
    } catch (error) {
      toast.error("Erro ao carregar imagem");
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  const mutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      if (place?.id) {
        const { error } = await supabase
          .from("places")
          .update(data)
          .eq("id", place.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("places")
          .insert([data]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["places"] });
      toast.success(place ? "Lugar atualizado com sucesso!" : "Lugar criado com sucesso!");
      onSuccess?.();
    },
    onError: (error) => {
      toast.error("Erro ao salvar lugar");
      console.error(error);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="image">Imagem em Destaque</Label>
        <Input
          id="image"
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          disabled={uploading}
        />
        {formData.image && (
          <img
            src={formData.image}
            alt="Preview"
            className="w-full h-48 object-cover rounded-md"
          />
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="name">Nome do Lugar *</Label>
        <Input
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Descrição</Label>
        <Textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">Endereço *</Label>
        <Input
          id="address"
          name="address"
          value={formData.address}
          onChange={handleChange}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="maps_url">Link do Google Maps</Label>
        <Input
          id="maps_url"
          name="maps_url"
          value={formData.maps_url}
          onChange={handleChange}
          placeholder="https://goo.gl/maps/..."
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="owner_name">Nome do Proprietário</Label>
        <Input
          id="owner_name"
          name="owner_name"
          value={formData.owner_name}
          onChange={handleChange}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="opening_hours">Horário de Funcionamento</Label>
        <Input
          id="opening_hours"
          name="opening_hours"
          value={formData.opening_hours}
          onChange={handleChange}
          placeholder="Segunda a Sexta: 9h às 18h"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="entrance_fee">Valor da Entrada</Label>
        <Input
          id="entrance_fee"
          name="entrance_fee"
          value={formData.entrance_fee}
          onChange={handleChange}
          placeholder="Gratuito ou valor"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="phone">Telefone</Label>
          <Input
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="(11) 1234-5678"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="whatsapp">WhatsApp</Label>
          <Input
            id="whatsapp"
            name="whatsapp"
            value={formData.whatsapp}
            onChange={handleChange}
            placeholder="(11) 91234-5678"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="website">Website</Label>
        <Input
          id="website"
          name="website"
          value={formData.website}
          onChange={handleChange}
          placeholder="https://..."
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="social_media.instagram">Instagram</Label>
          <Input
            id="social_media.instagram"
            name="social_media.instagram"
            value={formData.social_media.instagram}
            onChange={handleChange}
            placeholder="@usuario"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="social_media.facebook">Facebook</Label>
          <Input
            id="social_media.facebook"
            name="social_media.facebook"
            value={formData.social_media.facebook}
            onChange={handleChange}
            placeholder="https://facebook.com/..."
          />
        </div>
      </div>

      <Button
        type="submit"
        className="w-full"
        disabled={mutation.isPending || uploading}
      >
        {(mutation.isPending || uploading) && (
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        )}
        {place ? "Atualizar Lugar" : "Criar Lugar"}
      </Button>
    </form>
  );
}
