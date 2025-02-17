
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { Product } from "@/types/products";
import { useQuery } from "@tanstack/react-query";
import { MediaCarousel } from "@/components/MediaCarousel";

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const { data: product, isLoading, error } = useQuery({
    queryKey: ["product", id],
    queryFn: async () => {
      if (!id) throw new Error("No product ID provided");

      console.log("Fetching product with ID:", id); // Debug log

      const { data: productData, error: productError } = await supabase
        .from("products")
        .select(`
          *,
          profiles:profiles (
            full_name,
            avatar_url
          )
        `)
        .eq('id', id)
        .single();

      if (productError) {
        console.error("Error fetching product:", productError); // Debug log
        throw productError;
      }

      if (!productData) {
        console.error("No product data found for ID:", id); // Debug log
        throw new Error("Product not found");
      }

      console.log("Product data retrieved:", productData); // Debug log
      return productData as unknown as Product;
    },
    enabled: !!id,
    retry: 1
  });

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
    <div className="container mx-auto px-4 py-6 pb-20">
      <div className="flex items-center justify-between mb-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-6 w-6" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleShare}
        >
          <Share2 className="h-6 w-6" />
        </Button>
      </div>

      <MediaCarousel
        images={product.images}
        videoUrls={product.video_urls || []}
        title={product.title}
      />

      <Card className="mt-4">
        <CardContent className="p-6">
          <h1 className="text-2xl font-bold mb-2">{product.title}</h1>
          <p className="text-3xl font-bold mb-4">
            R$ {product.price.toFixed(2)}
          </p>
          
          <div className="space-y-4">
            <div>
              <h2 className="font-semibold mb-1">Descrição</h2>
              <p className="text-muted-foreground whitespace-pre-line">
                {product.description}
              </p>
            </div>

            <div>
              <h2 className="font-semibold mb-1">Condição</h2>
              <p className="text-muted-foreground capitalize">
                {product.condition}
              </p>
            </div>

            {product.location_name && (
              <div>
                <h2 className="font-semibold mb-1">Localização</h2>
                <p className="text-muted-foreground">
                  {product.location_name}
                </p>
              </div>
            )}

            <div>
              <h2 className="font-semibold mb-1">Vendedor</h2>
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-muted overflow-hidden">
                  {product.profiles?.avatar_url ? (
                    <img
                      src={product.profiles.avatar_url}
                      alt={product.profiles.full_name || ''}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-primary/10 flex items-center justify-center text-primary">
                      {product.profiles?.full_name?.[0]?.toUpperCase() || '?'}
                    </div>
                  )}
                </div>
                <span className="font-medium">
                  {product.profiles?.full_name || 'Usuário'}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProductDetails;
