
import { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import type { PlaceFormData, Place } from "../../types/places";

interface PlaceFormProps {
  initialData?: Place;
  onSubmit: (data: PlaceFormData) => void;
  onCancel: () => void;
}

export const PlaceForm = ({ initialData, onSubmit, onCancel }: PlaceFormProps) => {
  const [formData, setFormData] = useState<PlaceFormData>({
    name: "",
    description: "",
    address: "",
    city: "",
    state: "",
    postal_code: "",
    phone: "",
    website: "",
    image: "",
    images: [],
    opening_hours: {
      monday: "",
      tuesday: "",
      wednesday: "",
      thursday: "",
      friday: "",
      saturday: "",
      sunday: "",
    },
    category_id: null,
    owner_name: "",
    entrance_fee: "",
    whatsapp: "",
    maps_url: "",
    social_media: {
      facebook: "",
      instagram: "",
    },
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        description: initialData.description,
        address: initialData.address,
        city: initialData.city,
        state: initialData.state,
        postal_code: initialData.postal_code,
        phone: initialData.phone,
        website: initialData.website,
        image: initialData.image,
        images: initialData.images,
        opening_hours: initialData.opening_hours || {
          monday: "",
          tuesday: "",
          wednesday: "",
          thursday: "",
          friday: "",
          saturday: "",
          sunday: "",
        },
        category_id: initialData.category_id,
        owner_name: initialData.owner_name,
        entrance_fee: initialData.entrance_fee,
        whatsapp: initialData.whatsapp,
        maps_url: initialData.maps_url,
        social_media: initialData.social_media || {
          facebook: "",
          instagram: "",
        },
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
          <Label htmlFor="city">Cidade *</Label>
          <Input
            id="city"
            name="city"
            value={formData.city}
            onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="state">Estado *</Label>
          <Input
            id="state"
            name="state"
            value={formData.state}
            onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
            required
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

        {/* Horário de Funcionamento */}
        <div className="col-span-2">
          <Label>Horário de Funcionamento</Label>
          <div className="grid grid-cols-2 gap-4 mt-2">
            {["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"].map((day) => (
              <div key={day} className="space-y-2">
                <Label htmlFor={`opening_hours.${day}`} className="capitalize">
                  {day === "monday" ? "Segunda" :
                   day === "tuesday" ? "Terça" :
                   day === "wednesday" ? "Quarta" :
                   day === "thursday" ? "Quinta" :
                   day === "friday" ? "Sexta" :
                   day === "saturday" ? "Sábado" : "Domingo"}
                </Label>
                <Input
                  id={`opening_hours.${day}`}
                  name={`opening_hours.${day}`}
                  value={(formData.opening_hours as any)?.[day] || ""}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    opening_hours: {
                      ...prev.opening_hours,
                      [day]: e.target.value
                    }
                  }))}
                  placeholder="Ex: 09:00 - 18:00"
                />
              </div>
            ))}
          </div>
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
