
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProductWithDistance } from "@/types/products";
import { useTheme } from "./ThemeProvider";
import { Link } from "react-router-dom";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/card";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { MessageCircle, ThumbsUp } from "lucide-react";
import { MediaCarousel } from "./MediaCarousel";
import Tags from "./Tags";

interface Post {
  id: string;
  user_id: string;
  content: string;
  images: string[];
  video_urls: string[];
  likes: number;
  created_at: string;
  user: {
    username: string;
    full_name: string;
    avatar_url: string;
  };
  post_likes: { reaction_type: string; user_id: string; }[];
  post_comments: { id: string; }[];
}

interface ProfileTabsProps {
  userProducts: ProductWithDistance[] | undefined;
  userPosts: Post[] | undefined;
  isLoading?: boolean;
}

const ProfileTabs = ({ userProducts, userPosts, isLoading }: ProfileTabsProps) => {
  const { theme } = useTheme();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, "d 'de' MMMM 'às' HH:mm", { locale: ptBR });
  };

  return (
    <Tabs defaultValue="posts" className="w-full">
      <TabsList className="w-full justify-start border-b border-gray-800 bg-transparent">
        <TabsTrigger
          value="posts"
          className={`flex-1 text-sm py-4 border-0 data-[state=active]:border-b-2 ${
            theme === 'light' 
              ? 'data-[state=active]:text-black data-[state=active]:border-black' 
              : 'data-[state=active]:text-white data-[state=active]:border-white'
          }`}
        >
          Posts
        </TabsTrigger>
        <TabsTrigger
          value="products"
          className={`flex-1 text-sm py-4 border-0 data-[state=active]:border-b-2 ${
            theme === 'light' 
              ? 'data-[state=active]:text-black data-[state=active]:border-black' 
              : 'data-[state=active]:text-white data-[state=active]:border-white'
          }`}
        >
          Produtos
        </TabsTrigger>
        <TabsTrigger
          value="reels"
          className={`flex-1 text-sm py-4 border-0 data-[state=active]:border-b-2 ${
            theme === 'light' 
              ? 'data-[state=active]:text-black data-[state=active]:border-black' 
              : 'data-[state=active]:text-white data-[state=active]:border-white'
          }`}
        >
          Reels
        </TabsTrigger>
      </TabsList>

      <TabsContent value="posts" className="min-h-[200px]">
        {isLoading ? (
          <div className="flex items-center justify-center h-[200px]">
            <p className="text-gray-500">Carregando posts...</p>
          </div>
        ) : userPosts && userPosts.length > 0 ? (
          <div className="space-y-4 p-4">
            {userPosts.map((post) => (
              <Link to={`/posts/${post.id}`} key={post.id}>
                <Card className={`${theme === 'light' ? 'bg-white' : 'bg-black'} overflow-hidden`}>
                  <CardContent className="p-4">
                    <div className="space-y-4">
                      <div className="flex items-center space-x-4">
                        <Avatar>
                          <AvatarImage src={post.user.avatar_url} />
                          <AvatarFallback>
                            {post.user.full_name?.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold">{post.user.full_name}</p>
                          <p className="text-sm text-gray-500">
                            {formatDate(post.created_at)}
                          </p>
                        </div>
                      </div>

                      {post.content && (
                        <p className="text-sm">
                          <Tags content={post.content} />
                        </p>
                      )}

                      {(post.images?.length > 0 || post.video_urls?.length > 0) && (
                        <div className="w-full">
                          <MediaCarousel
                            images={post.images || []}
                            videoUrls={post.video_urls || []}
                            title={post.content || ""}
                            autoplay={false}
                            showControls={true}
                            cropMode="contain"
                          />
                        </div>
                      )}

                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center space-x-1">
                          <ThumbsUp className="h-4 w-4" />
                          <span>{post.post_likes?.length || 0}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <MessageCircle className="h-4 w-4" />
                          <span>{post.post_comments?.length || 0}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center h-[200px]">
            <p className="text-gray-500">Ainda não há Posts</p>
          </div>
        )}
      </TabsContent>

      <TabsContent value="products" className="min-h-[200px]">
        {userProducts && userProducts.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 p-4">
            {userProducts.map((product) => (
              <Link to={`/product/${product.id}`} key={product.id}>
                <Card className={`${theme === 'light' ? 'bg-white' : 'bg-black'} shadow-none border-0 transition-all duration-300 hover:scale-105`}>
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
              </Link>
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center h-[200px]">
            <p className="text-gray-500">Ainda não há Produtos</p>
          </div>
        )}
      </TabsContent>

      <TabsContent value="reels" className="min-h-[200px]">
        <div className="flex items-center justify-center h-[200px]">
          <p className="text-gray-500">Ainda não há Reels</p>
        </div>
      </TabsContent>
    </Tabs>
  );
};

export default ProfileTabs;
