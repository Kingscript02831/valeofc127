
import { useEffect, useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import SubNav from "@/components/SubNav";
import BottomNav from "@/components/BottomNav";
import type { ProductWithDistance } from "@/types/products";

const UserProducts = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("my-products");
  const [myProducts, setMyProducts] = useState<ProductWithDistance[]>([]);
  const [favoriteProducts, setFavoriteProducts] = useState<ProductWithDistance[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchMyProducts();
    fetchFavorites();
  }, []);

  const fetchMyProducts = async () => {
    try {
      const { data: products, error } = await supabase
        .from('products')
        .select('*')
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMyProducts(products?.map(product => ({
        ...product,
        distance: 0 // Adicionando a propriedade distance requerida
      })) || []);
    } catch (error) {
      toast({
        title: "Erro ao carregar produtos",
        description: "Não foi possível carregar seus produtos",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchFavorites = async () => {
    try {
      const { data: favorites, error } = await supabase
        .from('favorites')
        .select(`
          product_id,
          products (*)
        `)
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id);

      if (error) throw error;
      setFavoriteProducts(favorites?.map(f => ({
        ...f.products,
        distance: 0 // Adicionando a propriedade distance requerida
      })) || []);
    } catch (error) {
      toast({
        title: "Erro ao carregar favoritos",
        description: "Não foi possível carregar seus produtos favoritos",
        variant: "destructive",
      });
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);

      if (error) throw error;

      setMyProducts(products => products.filter(p => p.id !== productId));
      toast({
        title: "Produto excluído",
        description: "Produto removido com sucesso",
      });
    } catch (error) {
      toast({
        title: "Erro ao excluir",
        description: "Não foi possível excluir o produto",
        variant: "destructive",
      });
    }
  };

  const renderProductCard = (product: ProductWithDistance, showActions = false) => (
    <Card 
      key={product.id}
      className="cursor-pointer hover:shadow-lg transition-shadow"
      onClick={() => !showActions && navigate(`/product/${product.id}`)}
    >
      <div className="aspect-square relative overflow-hidden">
        <img
          src={product.images[0] || "/placeholder.svg"}
          alt={product.title}
          className="object-cover w-full h-full"
        />
      </div>
      <CardContent className="p-4">
        <h3 className="font-semibold truncate">{product.title}</h3>
        <p className="text-lg font-bold">
          R$ {product.price.toFixed(2)}
        </p>
        {showActions && (
          <div className="flex gap-2 mt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/products/new?edit=${product.id}`);
              }}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteProduct(product.id);
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <>
      <Navbar />
      <SubNav />
      <div className="container mx-auto px-4 pb-20 pt-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="my-products">Meus Produtos</TabsTrigger>
            <TabsTrigger value="favorites">Favoritos</TabsTrigger>
          </TabsList>
          
          <TabsContent value="my-products">
            {isLoading ? (
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                {[...Array(4)].map((_, i) => (
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
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 mt-4">
                {myProducts.map(product => renderProductCard(product, true))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="favorites">
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 mt-4">
              {favoriteProducts.map(product => renderProductCard(product))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
      <BottomNav />
    </>
  );
};

export default UserProducts;
