
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { MediaCarousel } from "./MediaCarousel";

interface Post {
  id: string;
  content: string;
  images: string[];
  video_urls: string[];
  created_at: string;
}

interface ProfileTabsProps {
  userId: string;
  userPosts: Post[];
  userProducts: any[];
}

const ProfileTabs = ({ userId, userPosts, userProducts }: ProfileTabsProps) => {
  return (
    <Tabs defaultValue="posts" className="w-full">
      <TabsList className="w-full justify-start border-b border-border bg-transparent">
        <TabsTrigger
          value="posts"
          className="flex-1 text-sm py-4 border-0 data-[state=active]:border-b-2 data-[state=active]:text-foreground data-[state=active]:border-foreground"
        >
          Posts
        </TabsTrigger>
        <TabsTrigger
          value="products"
          className="flex-1 text-sm py-4 border-0 data-[state=active]:border-b-2 data-[state=active]:text-foreground data-[state=active]:border-foreground"
        >
          Produtos
        </TabsTrigger>
        <TabsTrigger
          value="reels"
          className="flex-1 text-sm py-4 border-0 data-[state=active]:border-b-2 data-[state=active]:text-foreground data-[state=active]:border-foreground"
        >
          Reels
        </TabsTrigger>
      </TabsList>

      <TabsContent value="posts" className="min-h-[200px]">
        {userPosts && userPosts.length > 0 ? (
          <div className="space-y-4">
            {userPosts.map((post) => (
              <Link to={`/post/${post.id}`} key={post.id}>
                <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
                  <CardContent className="p-4">
                    <p className="text-sm text-muted-foreground mb-2">
                      {format(new Date(post.created_at), "d 'de' MMMM", {
                        locale: ptBR,
                      })}
                    </p>
                    {post.content && (
                      <p className="mb-4 line-clamp-3">{post.content}</p>
                    )}
                    {(post.images?.length > 0 || post.video_urls?.length > 0) && (
                      <div className="mb-4">
                        <MediaCarousel
                          images={post.images || []}
                          videoUrls={post.video_urls || []}
                          title={post.content || ""}
                        />
                      </div>
                    )}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center h-[200px]">
            <p className="text-muted-foreground">Ainda não há Posts</p>
          </div>
        )}
      </TabsContent>

      <TabsContent value="products" className="min-h-[200px]">
        {userProducts && userProducts.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 p-4">
            {userProducts.map((product) => (
              <Link to={`/product/${product.id}`} key={product.id}>
                <Card className="shadow-none border-0 transition-all duration-300 hover:scale-105">
                  <CardContent className="p-3">
                    {product.images?.[0] && (
                      <img
                        src={product.images[0]}
                        alt={product.title}
                        className="w-full aspect-square object-cover rounded-lg mb-2"
                      />
                    )}
                    <h3 className="font-medium">{product.title}</h3>
                    <p className="text-green-500">
                      {new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL'
                      }).format(Number(product.price))}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center h-[200px]">
            <p className="text-muted-foreground">Ainda não há Produtos</p>
          </div>
        )}
      </TabsContent>

      <TabsContent value="reels" className="min-h-[200px]">
        <div className="flex items-center justify-center h-[200px]">
          <p className="text-muted-foreground">Ainda não há Reels</p>
        </div>
      </TabsContent>
    </Tabs>
  );
};

export default ProfileTabs;

