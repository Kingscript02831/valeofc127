
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "../integrations/supabase/client";
import type { Product } from "../types/products";

const Products = () => {
  const { data: products, isLoading } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select(`
          *,
          profiles (
            full_name,
            avatar_url
          )
        `)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching products:", error);
        throw error;
      }
      
      console.log("Products fetched:", data); // Para debug
      return data as (Product & {
        profiles: {
          full_name: string;
          avatar_url: string;
        };
      })[];
    },
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-40 bg-muted rounded-lg mb-2" />
              <div className="h-4 bg-muted rounded w-3/4 mb-1" />
              <div className="h-4 bg-muted rounded w-1/2" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <div className="container mx-auto px-4 py-6 text-center">
        <p className="text-muted-foreground">Nenhum produto encontrado</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 pb-20">
      <div className="grid grid-cols-2 gap-4">
        {products.map((product) => (
          <Link
            key={product.id}
            to={`/products/${product.id}`}
            className="block group"
          >
            <div className="aspect-square rounded-lg overflow-hidden bg-muted mb-2">
              {product.images?.[0] && (
                <img
                  src={product.images[0]}
                  alt={product.title}
                  className="w-full h-full object-cover transition-transform group-hover:scale-105"
                />
              )}
            </div>
            <div className="space-y-1">
              <h3 className="font-medium line-clamp-2">{product.title}</h3>
              <p className="text-lg font-bold">
                R$ {product.price.toFixed(2)}
              </p>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-muted overflow-hidden">
                  {product.profiles?.avatar_url ? (
                    <img
                      src={product.profiles.avatar_url}
                      alt={product.profiles.full_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-primary/10 flex items-center justify-center text-primary text-xs">
                      {product.profiles?.full_name?.[0]?.toUpperCase()}
                    </div>
                  )}
                </div>
                <span className="text-sm text-muted-foreground line-clamp-1">
                  {product.profiles?.full_name}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Products;
