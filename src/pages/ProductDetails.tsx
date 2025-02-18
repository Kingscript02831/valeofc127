
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Share2, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { Product } from "@/types/products";
import { useQuery } from "@tanstack/react-query";
import { MediaCarousel } from "@/components/MediaCarousel";
import { Badge } from "@/components/ui/badge";
import { formatDistance } from "date-fns";
import { ptBR } from "date-fns/locale";
import Navbar from "@/components/Navbar";
import SubNav from "@/components/SubNav";
import BottomNav from "@/components/BottomNav";
import { useState, useEffect } from "react";

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isFavorite, setIsFavorite] = useState(false);

  // Buscar configuração do site
  const { data: siteConfig } = useQuery({
    queryKey: ["site-configuration"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("site_configuration")
        .select("*")
        .single();

      if (error) throw error;
      return data;
    },
  });

  const { data: product, isLoading, error } = useQuery({
    queryKey: ["product", id],
    queryFn: async () => {
      if (!id) throw new Error("No product ID provided");

      console.log("Fetching product with ID:", id);

      const { data: productData, error: productError } = await supabase
        .from("products")
        .select(`
          *,
          profiles (
            full_name,
            avatar_url
          )
        `)
        .eq('id', id)
        .single();

      if (productError) {
        console.error("Error fetching product:", productError);
        throw new Error("Erro ao buscar o produto");
      }

      if (!productData) {
        console.error("No product data found for ID:", id);
        throw new Error("Produto não encontrado");
      }

      console.log("Product data retrieved:", productData);
      return productData as Product;
    },
  });

  // Check if product is favorited
  useEffect(() => {
    const checkFavoriteStatus = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) return;

        const { data: favorite, error } = await supabase
          .from('favorites')
          .select('*')
          .eq('user_id', session.user.id)
          .eq('product_id', id)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error("Error checking favorite status:", error);
          return;
        }

        setIsFavorite(!!favorite);
      } catch (error) {
        console.error("Error checking favorite status:", error);
      }
    };

    if (id) {
      checkFavoriteStatus();
    }
  }, [id]);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product?.title,
          text: product?.description,
          url: window.location.href,
        });
      } catch (err) {
        console.error("Error sharing:", err);
      }
    } else {
      await navigator.clipboard.writeText(window.location.href);
      toast({
        description: "Link copiado para a área de transferência",
      });
    }
  };

  const handleContact = () => {
    if (product?.whatsapp) {
      let message = siteConfig?.whatsapp_message || 'Olá! Vi seu anúncio "{title}" por R$ {price} no Vale OFC e gostaria de mais informações.';
      
      // Substituir as variáveis na mensagem
      message = message
        .replace('{title}', product.title)
        .replace('{price}', product.price.toFixed(2));

      const whatsappLink = `https://wa.me/${product.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
      window.open(whatsappLink, '_blank');
    } else {
      toast({
        variant: "destructive",
        description: "Este produto não tem número de WhatsApp cadastrado",
      });
    }
  };

  const handleFavorite = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        toast({
          description: "Faça login para favoritar produtos",
          variant: "destructive",
        });
        return;
      }

      if (isFavorite) {
        const { error } = await supabase
          .from('favorites')
          .delete()
          .eq('user_id', session.user.id)
          .eq('product_id', id);

        if (error) throw error;

        setIsFavorite(false);
        toast({
          description: "Produto removido dos favoritos",
        });
      } else {
        const { error } = await supabase
          .from('favorites')
          .insert([
            {
              user_id: session.user.id,
              product_id: id,
            },
          ]);

        if (error) throw error;

        setIsFavorite(true);
        toast({
          description: "Produto adicionado aos favoritos",
        });
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
      toast({
        description: "Erro ao atualizar favoritos",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-6 animate-pulse">
        <div className="h-64 bg-muted rounded-lg mb-4" />
        <div className="space-y-4">
          <div className="h-8 bg-muted rounded w-3/4" />
          <div className="h-6 bg-muted rounded w-1/4" />
          <div className="h-24 bg-muted rounded" />
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center mb-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-6 w-6" />
          </Button>
        </div>
        <p className="text-center text-lg">
          {error instanceof Error ? error.message : 'Produto não encontrado'}
        </p>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <SubNav />
      <div className="container mx-auto px-4 py-6 pb-32">
        <div className="flex items-center justify-between mb-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="hover:scale-105 transition-transform"
          >
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <div className="flex gap-2">
            <Button
              variant={isFavorite ? "default" : "ghost"}
              size="icon"
              onClick={handleFavorite}
              className="hover:scale-105 transition-transform"
            >
              <Heart className={`h-6 w-6 ${isFavorite ? 'fill-current' : ''}`} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleShare}
              className="hover:scale-105 transition-transform"
            >
              <Share2 className="h-6 w-6" />
            </Button>
          </div>
        </div>

        <div className="bg-card text-card-foreground rounded-xl shadow-lg overflow-hidden border border-border transition-all duration-300 hover:shadow-xl">
          <div className="p-4 border-b border-border">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-muted overflow-hidden shadow-md">
                {product?.profiles?.avatar_url ? (
                  <img
                    src={product.profiles.avatar_url}
                    alt={product.profiles.full_name || ''}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-primary/10 flex items-center justify-center text-primary text-lg font-semibold">
                    {product?.profiles?.full_name?.[0]?.toUpperCase() || '?'}
                  </div>
                )}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-lg">
                  {product?.profiles?.full_name || 'Usuário'}
                </p>
                {product?.created_at && (
                  <p className="text-sm text-muted-foreground">
                    Anunciado há {formatDistance(new Date(product.created_at), new Date(), { locale: ptBR })}
                  </p>
                )}
              </div>
            </div>
          </div>

          <MediaCarousel
            images={product?.images || []}
            videoUrls={product?.video_urls || []}
            title={product?.title || ""}
          />

          <div className="p-6 space-y-6">
            <div>
              <div className="flex justify-between items-start mb-2">
                <h1 className="text-2xl font-bold text-foreground">{product?.title}</h1>
                <Badge variant="outline" className="capitalize shadow-sm hover:shadow-md transition-shadow">
                  {product?.condition}
                </Badge>
              </div>
              <p className="text-3xl font-bold text-primary">
                R$ {product?.price.toFixed(2)}
              </p>
            </div>
            
            <Card className="bg-muted/50">
              <CardContent className="p-4">
                <h2 className="text-lg font-semibold mb-2">Descrição</h2>
                <p className="text-muted-foreground whitespace-pre-line">
                  {product?.description}
                </p>
              </CardContent>
            </Card>

            {product?.location_name && (
              <Card className="bg-muted/50">
                <CardContent className="p-4">
                  <h2 className="text-lg font-semibold mb-2">Localização</h2>
                  <p className="text-muted-foreground">
                    {product.location_name}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        <div className="fixed bottom-16 left-0 right-0 p-4 bg-background/80 backdrop-blur-md border-t border-border">
          <Button 
            className="w-full h-12 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
            onClick={handleContact}
            style={{ backgroundColor: siteConfig?.buy_button_color }}
          >
            {siteConfig?.buy_button_text || "Comprar agora"}
          </Button>
        </div>
      </div>
      <BottomNav />
    </>
  );
};

export default ProductDetails;
