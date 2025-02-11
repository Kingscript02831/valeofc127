
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
    opening_hours: null,
    category_id: null,
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
        opening_hours: initialData.opening_hours,
        category_id: initialData.category_id,
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
          <Label htmlFor="phone">Telefone</Label>
          <Input
            id="phone"
            name="phone"
            value={formData.phone || ""}
            onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
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
