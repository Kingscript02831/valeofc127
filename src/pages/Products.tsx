import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, User, Menu, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { Product } from "@/types/products";
import type { Location } from "@/types/locations";
import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/Navbar";
import BottomNav from "@/components/BottomNav";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";

const Products = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [showLocationDialog, setShowLocationDialog] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [radiusValue, setRadiusValue] = useState([5]);

  const { data: categories } = useQuery({
    queryKey: ["categories-products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .eq('page_type', 'products')
        .order("name");
      
      if (error) throw error;
      return data;
    },
  });

  const { data: locations } = useQuery({
    queryKey: ['locations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('locations')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data as Location[];
    }
  });

  const { data: products, isLoading } = useQuery({
    queryKey: ["products", selectedLocation?.id, radiusValue[0]],
    queryFn: async () => {
      let query = supabase
        .from("products")
        .select("*, profiles(full_name, avatar_url)")
        .order("created_at", { ascending: false });

      if (selectedCategory) {
        query = query.eq("category_id", selectedCategory);
      }

      if (selectedLocation) {
        query = query.eq("location_id", selectedLocation.id);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as Product[];
    },
  });

  const filteredProducts = products?.filter(product =>
    product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSaveLocation = () => {
    if (selectedLocation) {
      setShowLocationDialog(false);
      toast({
        title: "Localização salva",
        description: `Buscando produtos em um raio de ${radiusValue[0]}km de ${selectedLocation.name}`,
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 pb-20 pt-20">
        <div className="sticky top-16 z-10 bg-background/80 backdrop-blur-sm pb-4">
          <div className="flex gap-2 mb-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/user-products")}
              className="hover:scale-105 transition-transform text-foreground"
            >
              <User className="h-5 w-5" />
            </Button>
            <div className="relative flex-1">
              <Input
                placeholder="Buscar produtos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10 rounded-full bg-card/50 backdrop-blur-sm border-none shadow-lg"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <Search className="h-5 w-5 text-foreground" />
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="hover:scale-105 transition-transform text-foreground rounded-full shadow-lg"
                >
                  <Menu className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem
                  onClick={() => setSelectedCategory(null)}
                  className={!selectedCategory ? "bg-accent" : ""}
                >
                  Todas as categorias
                </DropdownMenuItem>
                {categories?.map((category) => (
                  <DropdownMenuItem
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={selectedCategory === category.id ? "bg-accent" : ""}
                  >
                    {category.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-foreground">Seleções de hoje</h1>
          <Dialog open={showLocationDialog} onOpenChange={setShowLocationDialog}>
            <DialogTrigger asChild>
              <Button variant="ghost" className="text-primary flex items-center gap-2">
                <span>{selectedLocation?.name || 'Selecionar localização'}</span>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Localização</DialogTitle>
              </DialogHeader>
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label>Localização</Label>
                  <RadioGroup 
                    value={selectedLocation?.id} 
                    onValueChange={(value) => {
                      const location = locations?.find(loc => loc.id === value);
                      setSelectedLocation(location || null);
                    }}
                  >
                    {locations?.map((location) => (
                      <div key={location.id} className="flex items-center space-x-2">
                        <RadioGroupItem value={location.id} id={location.id} />
                        <Label htmlFor={location.id}>{location.name} - {location.state}</Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>

                <div className="space-y-4">
                  <Label>Raio de busca: {radiusValue[0]}km</Label>
                  <Slider
                    value={radiusValue}
                    onValueChange={setRadiusValue}
                    max={30}
                    min={1}
                    step={1}
                  />
                </div>

                <Button className="w-full" onClick={handleSaveLocation}>
                  Salvar
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-4">
            {[...Array(8)].map((_, i) => (
              <Card key={i} className="animate-pulse bg-transparent shadow-none border-none">
                <div className="aspect-square bg-muted rounded-lg" />
                <CardContent className="p-3">
                  <div className="h-4 bg-muted rounded mb-2" />
                  <div className="h-4 bg-muted rounded w-1/2" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-4">
            {filteredProducts?.map((product) => (
              <Card 
                key={product.id}
                className="cursor-pointer hover:scale-105 transition-transform shadow-none border-none overflow-hidden bg-transparent"
                onClick={() => navigate(`/product/${product.id}`)}
              >
                <div className="aspect-square relative overflow-hidden rounded-lg">
                  <img
                    src={product.images[0] || "/placeholder.svg"}
                    alt={product.title}
                    className="object-cover w-full h-full hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute top-2 right-2 bg-primary/80 backdrop-blur-sm text-white px-2 py-1 rounded-full text-xs">
                    {product.condition}
                  </div>
                  {product.location_name && (
                    <div className="absolute top-2 left-2 bg-primary/80 backdrop-blur-sm text-white px-2 py-1 rounded-full text-xs">
                      {product.location_name}
                    </div>
                  )}
                </div>
                <CardContent className="p-3">
                  <div className="mb-1">
                    <span className="text-lg font-bold text-foreground">
                      R$ {product.price.toFixed(2)}
                    </span>
                  </div>
                  <h3 className="font-semibold truncate mb-1 text-foreground">
                    {product.title}
                  </h3>
                  {product.location_name && (
                    <p className="text-sm truncate mt-1 text-foreground/60">
                      {product.location_name}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default Products;
