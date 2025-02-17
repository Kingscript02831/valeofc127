
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { ProductWithDistance } from "@/types/products";
import { useQuery } from "@tanstack/react-query";

const Products = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [userLocation, setUserLocation] = useState<{lat: number; lon: number} | null>(null);

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lon: position.coords.longitude
          });
        },
        () => {
          toast({
            title: "Localização não disponível",
            description: "Ative a localização para ver produtos próximos",
            variant: "destructive",
          });
        }
      );
    }
  }, [toast]);

  const { data: products, isLoading } = useQuery({
    queryKey: ["products", userLocation],
    queryFn: async () => {
      if (!userLocation) {
        const { data, error } = await supabase
          .from("products")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) throw error;
        return data as ProductWithDistance[];
      }

      const { data, error } = await supabase
        .rpc("search_products_by_location", {
          search_lat: userLocation.lat,
          search_lon: userLocation.lon,
          radius_in_meters: 5000
        });

      if (error) throw error;
      return data as ProductWithDistance[];
    },
    enabled: true,
  });

  const filteredProducts = products?.filter(product =>
    product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto px-4 pb-20 pt-4">
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm pb-4">
        <div className="flex gap-2 mb-4">
          <Input
            placeholder="Buscar produtos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1"
          />
          <Button
            variant="outline"
            size="icon"
            onClick={() => {
              if ("geolocation" in navigator) {
                navigator.geolocation.getCurrentPosition(
                  (position) => {
                    setUserLocation({
                      lat: position.coords.latitude,
                      lon: position.coords.longitude
                    });
                  }
                );
              }
            }}
          >
            <MapPin className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {[...Array(8)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <div className="aspect-square bg-muted" />
              <CardContent className="p-4">
                <div className="h-4 bg-muted rounded mb-2" />
                <div className="h-4 bg-muted rounded w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {filteredProducts?.map((product) => (
            <Card 
              key={product.id}
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => navigate(`/products/${product.id}`)}
            >
              <div className="aspect-square relative overflow-hidden">
                <img
                  src={product.images[0] || "/placeholder.svg"}
                  alt={product.title}
                  className="object-cover w-full h-full"
                />
                {product.distance && (
                  <div className="absolute bottom-2 left-2 bg-black/50 text-white px-2 py-1 rounded-full text-xs flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {(product.distance / 1000).toFixed(1)}km
                  </div>
                )}
              </div>
              <CardContent className="p-4">
                <h3 className="font-semibold truncate">{product.title}</h3>
                <p className="text-lg font-bold">
                  R$ {product.price.toFixed(2)}
                </p>
                {product.location_name && (
                  <p className="text-sm text-muted-foreground truncate">
                    {product.location_name}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Products;
