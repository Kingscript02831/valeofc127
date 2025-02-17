
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Share2, Heart, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { Product } from "@/types/products";
import { useQuery } from "@tanstack/react-query";
import { MediaCarousel } from "@/components/MediaCarousel";
import { useState, useEffect } from "react";

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isFavorite, setIsFavorite] = useState(false);

  const { data: product, isLoading, error } = useQuery({
    queryKey: ["product", id],
    queryFn: async () => {
      if (!id) throw new Error("No product ID provided");

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

      if (productError) throw new Error("Erro ao buscar o produto");
      if (!productData) throw new Error("Produto não encontrado");

      return productData as Product;
    },
  });

  // Verifica se o produto está nos favoritos
  useEffect(() => {
    const checkFavorite = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user && id) {
        const { data } = await supabase
          .from('favorites')
          .select('*')
          .eq('user_id', user.id)
          .eq('product_id', id)
          .single();
        
        setIsFavorite(!!data);
      }
    };

    checkFavorite();
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

  const handleFavorite = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      toast({
        description: "Você precisa estar logado para favoritar produtos",
        variant: "destructive"
      });
      return;
    }

    try {
      if (isFavorite) {
        await supabase
          .from('favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('product_id', id);
      } else {
        await supabase
          .from('favorites')
          .insert([{ user_id: user.id, product_id: id }]);
      }
      
      setIsFavorite(!isFavorite);
      toast({
        description: isFavorite ? "Removido dos favoritos" : "Adicionado aos favoritos",
      });
    } catch (error) {
      toast({
        description: "Erro ao atualizar favoritos",
        variant: "destructive"
      });
    }
  };

  const handleWhatsAppClick = () => {
    if (!product?.whatsapp) {
      toast({
        description: "Vendedor não disponibilizou número de WhatsApp",
        variant: "destructive"
      });
      return;
    }

    const message = `Olá! Vi seu produto "${product.title}" por R$ ${product.price.toFixed(2)} no Vale Notícias e gostaria de mais informações.`;
    const whatsappUrl = `https://wa.me/${product.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-6 animate-pulse">
        <div className="h-96 bg-muted rounded-lg mb-4" />
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
    <div className="container mx-auto px-4 py-6 pb-20 max-w-4xl">
      <div className="flex items-center justify-between mb-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-6 w-6" />
        </Button>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleFavorite}
            className={isFavorite ? "text-red-500" : ""}
          >
            <Heart className={`h-6 w-6 ${isFavorite ? "fill-current" : ""}`} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleShare}
          >
            <Share2 className="h-6 w-6" />
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-xl overflow-hidden shadow-lg dark:bg-gray-800">
        <div className="h-[500px] relative">
          <MediaCarousel
            images={product.images}
            videoUrls={product.video_urls || []}
            title={product.title}
          />
        </div>

        <div className="p-6 space-y-6">
          <div>
            <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">{product.title}</h1>
            <p className="text-4xl font-bold text-primary mb-4">
              R$ {product.price.toFixed(2)}
            </p>
          </div>
          
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Descrição</h2>
              <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed whitespace-pre-line">
                {product.description}
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Condição</h2>
              <p className="text-gray-600 dark:text-gray-300 capitalize text-lg">
                {product.condition}
              </p>
            </div>

            {product.location_name && (
              <div>
                <h2 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Localização</h2>
                <p className="text-gray-600 dark:text-gray-300 text-lg">
                  {product.location_name}
                </p>
              </div>
            )}

            <div className="border-t pt-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Vendedor</h2>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-muted overflow-hidden">
                  {product.profiles?.avatar_url ? (
                    <img
                      src={product.profiles.avatar_url}
                      alt={product.profiles.full_name || ''}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-primary/10 flex items-center justify-center text-primary text-2xl">
                      {product.profiles?.full_name?.[0]?.toUpperCase() || '?'}
                    </div>
                  )}
                </div>
                <div>
                  <span className="font-medium text-lg text-gray-900 dark:text-white">
                    {product.profiles?.full_name || 'Usuário'}
                  </span>
                  {product.whatsapp && (
                    <p className="text-gray-500 dark:text-gray-400">
                      WhatsApp disponível
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white dark:bg-gray-800 border-t dark:border-gray-700 shadow-lg">
        <div className="container mx-auto max-w-4xl">
          <Button 
            className="w-full py-6 text-lg"
            onClick={handleWhatsAppClick}
          >
            <MessageCircle className="h-5 w-5 mr-2" />
            Comprar Agora via WhatsApp
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
