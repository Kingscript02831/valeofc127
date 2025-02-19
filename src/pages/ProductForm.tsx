
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
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
import { toast } from "sonner";
import { supabase } from "../integrations/supabase/client";
import type { ProductFormData } from "../types/products";

const ProductForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const editProductId = searchParams.get('edit');
  
  const [loading, setLoading] = useState(false);
  const [newImageUrl, setNewImageUrl] = useState("");
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [newVideoUrl, setNewVideoUrl] = useState("");
  const [videoUrls, setVideoUrls] = useState<string[]>([]);
  const [formData, setFormData] = useState<ProductFormData>({
    title: "",
    description: "",
    price: 0,
    condition: "novo",
    images: [],
  });

  useEffect(() => {
    const loadProduct = async () => {
      if (!editProductId) return;

      try {
        const { data: product, error } = await supabase
          .from('products')
          .select('*')
          .eq('id', editProductId)
          .single();

        if (error) throw error;

        if (product) {
          setFormData({
            title: product.title,
            description: product.description,
            price: product.price,
            condition: product.condition,
            images: product.images,
            whatsapp: product.whatsapp,
          });
          setImageUrls(product.images || []);
          setVideoUrls(product.video_urls || []);
        }
      } catch (error) {
        toast.error("Erro ao carregar produto");
      }
    };

    loadProduct();
  }, [editProductId]);

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

    if (!imageUrls.includes(directImageUrl)) {
      setImageUrls([...imageUrls, directImageUrl]);
      setNewImageUrl("");
      toast.success("Imagem adicionada com sucesso!");
    } else {
      toast.error("Esta imagem já foi adicionada");
    }
  };

  const handleRemoveImage = (imageUrl: string) => {
    setImageUrls(imageUrls.filter(url => url !== imageUrl));
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

    if (!videoUrls.includes(directVideoUrl)) {
      setVideoUrls([...videoUrls, directVideoUrl]);
      setNewVideoUrl("");
      toast.success("Vídeo adicionado com sucesso!");
    } else {
      toast.error("Este vídeo já foi adicionado");
    }
  };

  const handleRemoveVideo = (videoUrl: string) => {
    setVideoUrls(videoUrls.filter(url => url !== videoUrl));
    toast.success("Vídeo removido com sucesso!");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("Você precisa estar logado para publicar um produto");
        return;
      }

      // Tenta obter a localização, mas continua mesmo se não conseguir
      let locationData = {};
      try {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject);
        });
        locationData = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };
      } catch (error) {
        console.log("Geolocalização não disponível ou negada");
      }

      const productData = {
        ...formData,
        images: imageUrls,
        video_urls: videoUrls,
        user_id: user.id,
        ...locationData,
      };

      let error;

      if (editProductId) {
        ({ error } = await supabase
          .from("products")
          .update(productData)
          .eq('id', editProductId));
      } else {
        ({ error } = await supabase
          .from("products")
          .insert(productData));
      }

      if (error) throw error;

      toast.success(editProductId ? "Produto atualizado com sucesso!" : "Produto adicionado com sucesso!");
      navigate("/products");
    } catch (error: any) {
      toast.error("Erro ao " + (editProductId ? "atualizar" : "adicionar") + " produto: " + error.message);
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
        <h1 className="text-2xl font-bold">{editProductId ? "Editar Produto" : "Novo Produto"}</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label>Imagens do Dropbox</Label>
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input
                value={newImageUrl}
                onChange={(e) => setNewImageUrl(e.target.value)}
                placeholder="Cole a URL compartilhada do Dropbox"
              />
              <Button type="button" onClick={handleAddImage}>
                <Plus className="h-4 w-4 mr-2" />
                Adicionar
              </Button>
            </div>
            <div className="grid grid-cols-1 gap-2">
              {imageUrls.map((url, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input value={url} readOnly />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    onClick={() => handleRemoveImage(url)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Vídeos (Dropbox ou YouTube)</Label>
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input
                value={newVideoUrl}
                onChange={(e) => setNewVideoUrl(e.target.value)}
                placeholder="Cole a URL do Dropbox ou YouTube"
              />
              <Button type="button" onClick={handleAddVideo}>
                <Plus className="h-4 w-4 mr-2" />
                Adicionar
              </Button>
            </div>
            <div className="grid grid-cols-1 gap-2">
              {videoUrls.map((url, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input value={url} readOnly />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    onClick={() => handleRemoveVideo(url)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
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
          <Label htmlFor="whatsapp">WhatsApp</Label>
          <Input
            id="whatsapp"
            type="tel"
            value={formData.whatsapp || ""}
            onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
            placeholder="(00) 00000-0000"
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
          {loading ? "Publicando..." : (editProductId ? "Atualizar Produto" : "Publicar Produto")}
        </Button>
      </form>
    </div>
  );
};

export default ProductForm;
