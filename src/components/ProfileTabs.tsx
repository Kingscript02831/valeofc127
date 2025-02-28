import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { useTheme } from "../components/ThemeProvider";
import { Card } from "./ui/card";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Button } from "./ui/button";
import { MediaCarousel } from "../components/MediaCarousel";
import Tags from "../components/Tags";
import type { Product } from "../types/products";
import type { Profile } from "../types/profile";
import { MapPin } from "lucide-react";

interface ProfileTabsProps {
  userProducts?: Product[];
  userPosts?: any[];
  isLoading?: boolean;
}

const ProfileTabs = ({ userProducts, userPosts, isLoading }: ProfileTabsProps) => {
  const [activeTab, setActiveTab] = useState("posts");
  const { theme } = useTheme();

  if (isLoading) {
    return <div>Carregando...</div>;
  }

  return (
    <Tabs defaultValue="posts" className="w-full">
      <TabsList>
        <TabsTrigger value="posts">Posts</TabsTrigger>
        <TabsTrigger value="products">Produtos</TabsTrigger>
      </TabsList>

      <TabsContent value="posts" className="mt-4">
        <div className="space-y-4">
          {userPosts?.map((post) => (
            <Card key={post.id} className="overflow-hidden">
              <div className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="flex flex-col">
                      <div className="text-sm text-muted-foreground">
                        {post.created_at && (
                          <p className="text-sm text-gray-500">
                            {formatDistanceToNow(new Date(post.created_at), {
                              addSuffix: true,
                              locale: ptBR,
                            })}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {post.content && (
                  <div className="mt-2">
                    <Tags content={post.content} />
                  </div>
                )}

                {post.location_name && (
                  <div className="flex items-center gap-1 mt-2 text-sm text-gray-500">
                    <MapPin className="h-4 w-4" />
                    <span>{post.location_name}</span>
                  </div>
                )}
              </div>

              {(post.images?.length > 0 || post.video_urls?.length > 0) && (
                <div className="relative mt-2">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500/30 to-blue-500/30 rounded-lg pointer-events-none" />
                  <MediaCarousel
                    images={post.images || []}
                    videoUrls={post.video_urls || []}
                    title="Mídia do post"
                  />
                </div>
              )}

              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Button variant="ghost" size="sm" className="text-gray-500">
                    {post.post_likes?.length || 0} curtidas
                  </Button>
                  <Button variant="ghost" size="sm" className="text-gray-500">
                    {post.post_comments?.length || 0} comentários
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </TabsContent>

      <TabsContent value="products" className="mt-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {userProducts?.map((product) => (
            <Card key={product.id}>
              <div className="relative">
                {product.images && product.images.length > 0 ? (
                  <img
                    src={product.images[0]}
                    alt={product.title}
                    className="w-full h-48 object-cover rounded-md"
                  />
                ) : (
                  <div className="w-full h-48 bg-gray-200 rounded-md" />
                )}
              </div>
              <CardContent className="p-4">
                <h3 className="text-lg font-semibold">{product.title}</h3>
                <p className="text-gray-500">R$ {product.price}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </TabsContent>
    </Tabs>
  );
};

export default ProfileTabs;
