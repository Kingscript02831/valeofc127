
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProductWithDistance } from "@/types/products";
import { useTheme } from "./ThemeProvider";

interface ProfileTabsProps {
  userProducts: ProductWithDistance[] | undefined;
}

const ProfileTabs = ({ userProducts }: ProfileTabsProps) => {
  const { theme } = useTheme();

  return (
    <Tabs defaultValue="posts" className="w-full">
      <TabsList className="w-full justify-start border-b border-gray-800 bg-transparent">
        <TabsTrigger
          value="posts"
          className={`flex-1 text-xl py-4 border-0 data-[state=active]:border-b-2 ${
            theme === 'light' 
              ? 'data-[state=active]:text-black data-[state=active]:border-black' 
              : 'data-[state=active]:text-white data-[state=active]:border-white'
          }`}
        >
          Posts
        </TabsTrigger>
        <TabsTrigger
          value="products"
          className={`flex-1 text-xl py-4 border-0 data-[state=active]:border-b-2 ${
            theme === 'light' 
              ? 'data-[state=active]:text-black data-[state=active]:border-black' 
              : 'data-[state=active]:text-white data-[state=active]:border-white'
          }`}
        >
          Produtos
        </TabsTrigger>
        <TabsTrigger
          value="reels"
          className={`flex-1 text-xl py-4 border-0 data-[state=active]:border-b-2 ${
            theme === 'light' 
              ? 'data-[state=active]:text-black data-[state=active]:border-black' 
              : 'data-[state=active]:text-white data-[state=active]:border-white'
          }`}
        >
          Reels
        </TabsTrigger>
      </TabsList>

      <TabsContent value="posts" className="min-h-[200px]">
        <div className="grid grid-cols-3 gap-1">
          <div className="aspect-square bg-gray-800/50 flex items-center justify-center">
            <p className="text-gray-500">Ainda não há Posts</p>
          </div>
        </div>
      </TabsContent>

      <TabsContent value="products" className="min-h-[200px]">
        {userProducts && userProducts.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 p-4">
            {userProducts.map((product) => (
              <Card key={product.id} className={`${theme === 'light' ? 'bg-white' : 'bg-black'} shadow-none border-0`}>
                <CardContent className="p-3">
                  {product.images?.[0] && (
                    <img
                      src={product.images[0]}
                      alt={product.title}
                      className="w-full aspect-square object-cover rounded-lg mb-2"
                    />
                  )}
                  <h3 className={`font-medium ${theme === 'light' ? 'text-black' : 'text-white'}`}>{product.title}</h3>
                  <p className="text-green-500">
                    {new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL'
                    }).format(Number(product.price))}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center h-[200px]">
            <p className="text-gray-500">Ainda não há Produtos</p>
          </div>
        )}
      </TabsContent>

      <TabsContent value="reels" className="min-h-[200px]">
        <div className="grid grid-cols-3 gap-1">
          <div className="aspect-square bg-gray-800/50 flex items-center justify-center">
            <p className="text-gray-500">Ainda não há Reels</p>
          </div>
        </div>
      </TabsContent>
    </Tabs>
  );
};

export default ProfileTabs;
