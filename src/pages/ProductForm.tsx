
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { ProductFormData } from "@/types/products";

const ProductForm = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const [formData, setFormData] = useState<ProductFormData>({
    title: "",
    description: "",
    price: 0,
    condition: "novo",
    images: [],
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setImages(files);
  };

  const uploadImages = async () => {
    const uploadedUrls: string[] = [];

    for (const image of images) {
      const fileExt = image.name.split(".").pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `products/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("public")
        .upload(filePath, image);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("public")
        .getPublicUrl(filePath);

      uploadedUrls.push(publicUrl);
    }

    return uploadedUrls;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Get user's location
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      });

      // Upload images
      const imageUrls = await uploadImages();

      // Create product
      const { error } = await supabase.from("products").insert({
        ...formData,
        images: imageUrls,
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      });

      if (error) throw error;

      toast({
        title: "Produto adicionado com sucesso!",
        description: "Seu produto já está disponível para visualização.",
      });

      navigate("/products");
    } catch (error: any) {
      toast({
        title: "Erro ao adicionar produto",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 pb-20">
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-6 w-6" />
        </Button>
        <h1 className="text-2xl font-bold">Novo Produto</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <Label htmlFor="images">Fotos do Produto</Label>
          <div className="mt-2">
            <Input
              id="images"
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageChange}
              className="hidden"
            />
            <Button
              type="button"
              variant="outline"
              className="w-full h-32"
              onClick={() => document.getElementById("images")?.click()}
            >
              <div className="flex flex-col items-center gap-2">
                <Upload className="h-6 w-6" />
                <span>Adicionar fotos</span>
                {images.length > 0 && (
                  <span className="text-sm text-muted-foreground">
                    {images.length} foto(s) selecionada(s)
                  </span>
                )}
              </div>
            </Button>
          </div>
        </div>

        <div>
          <Label htmlFor="title">Título</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="Ex: iPhone 12 Pro Max 128GB"
            required
          />
        </div>

        <div>
          <Label htmlFor="description">Descrição</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Descreva seu produto em detalhes..."
            required
          />
        </div>

        <div>
          <Label htmlFor="price">Preço</Label>
          <Input
            id="price"
            type="number"
            step="0.01"
            min="0"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
            placeholder="R$ 0,00"
            required
          />
        </div>

        <div>
          <Label htmlFor="condition">Condição</Label>
          <Select
            value={formData.condition}
            onValueChange={(value) => setFormData({ ...formData, condition: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione a condição" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="novo">Novo</SelectItem>
              <SelectItem value="usado">Usado</SelectItem>
              <SelectItem value="recondicionado">Recondicionado</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Publicando..." : "Publicar Produto"}
        </Button>
      </form>
    </div>
  );
};

export default ProductForm;
