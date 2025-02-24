
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";
import Navbar from "../components/Navbar";
import BottomNav from "../components/BottomNav";
import { Card } from "../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import NewsCard from "../components/NewsCard";
import EventCard from "../components/EventCard";
import PlaceCard from "../components/PlaceCard";
import { MediaCarousel } from "../components/MediaCarousel";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const Feed = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("all");

  const { data: news } = useQuery({
    queryKey: ['feed-news'],
    queryFn: async () => {
      const { data } = await supabase
        .from('news')
        .select(`
          *,
          categories (
            name,
            background_color
          )
        `)
        .order('created_at', { ascending: false })
        .limit(10);
      return data;
    },
  });

  const { data: posts } = useQuery({
    queryKey: ['feed-posts'],
    queryFn: async () => {
      const { data } = await supabase
        .from('posts')
        .select(`
          *,
          user:user_id (
            username,
            full_name,
            avatar_url
          )
        `)
        .order('created_at', { ascending: false })
        .limit(10);
      return data;
    },
  });

  const { data: products } = useQuery({
    queryKey: ['feed-products'],
    queryFn: async () => {
      const { data } = await supabase
        .from('products')
        .select(`
          *,
          categories (
            name,
            background_color
          )
        `)
        .order('created_at', { ascending: false })
        .limit(10);
      return data;
    },
  });

  const { data: events } = useQuery({
    queryKey: ['feed-events'],
    queryFn: async () => {
      const { data } = await supabase
        .from('events')
        .select(`
          *,
          categories (
            name,
            background_color
          )
        `)
        .order('created_at', { ascending: false })
        .limit(10);
      return data;
    },
  });

  const { data: places } = useQuery({
    queryKey: ['feed-places'],
    queryFn: async () => {
      const { data } = await supabase
        .from('places')
        .select(`
          *,
          categories (
            name,
            background_color
          )
        `)
        .order('created_at', { ascending: false })
        .limit(10);
      return data;
    },
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto py-8 px-4 pt-20 pb-24">
        <Tabs defaultValue="all" className="w-full" onValueChange={setActiveTab}>
          <TabsList className="w-full mb-6 grid grid-cols-6 h-auto gap-2">
            <TabsTrigger value="all" className="data-[state=active]:bg-primary/20">
              Todos
            </TabsTrigger>
            <TabsTrigger value="news" className="data-[state=active]:bg-primary/20">
              Notícias
            </TabsTrigger>
            <TabsTrigger value="posts" className="data-[state=active]:bg-primary/20">
              Posts
            </TabsTrigger>
            <TabsTrigger value="products" className="data-[state=active]:bg-primary/20">
              Produtos
            </TabsTrigger>
            <TabsTrigger value="events" className="data-[state=active]:bg-primary/20">
              Eventos
            </TabsTrigger>
            <TabsTrigger value="places" className="data-[state=active]:bg-primary/20">
              Lugares
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-6">
            {[
              ...(news || []).map(item => ({ ...item, type: 'news' })),
              ...(posts || []).map(item => ({ ...item, type: 'post' })),
              ...(products || []).map(item => ({ ...item, type: 'product' })),
              ...(events || []).map(item => ({ ...item, type: 'event' })),
              ...(places || []).map(item => ({ ...item, type: 'place' }))
            ]
            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
            .map((item) => {
              switch (item.type) {
                case 'news':
                  return <NewsCard key={`news-${item.id}`} {...item} />;
                case 'post':
                  return (
                    <Card key={`post-${item.id}`} className="overflow-hidden bg-card">
                      <div className="p-4">
                        <div className="flex items-center gap-3 mb-4">
                          <Avatar 
                            className="cursor-pointer hover:opacity-80"
                            onClick={() => navigate(`/perfil/${item.user?.username}`)}
                          >
                            <AvatarImage src={item.user?.avatar_url} />
                            <AvatarFallback>{item.user?.full_name?.[0]}</AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-semibold">{item.user?.full_name}</h3>
                            <p className="text-sm text-muted-foreground">
                              {format(new Date(item.created_at), "d 'de' MMMM 'às' HH:mm", { locale: ptBR })}
                            </p>
                          </div>
                        </div>
                        <p className="text-foreground mb-4">{item.content}</p>
                        {(item.images?.length > 0 || item.video_urls?.length > 0) && (
                          <MediaCarousel
                            images={item.images || []}
                            videoUrls={item.video_urls || []}
                            title={item.content || ""}
                          />
                        )}
                      </div>
                    </Card>
                  );
                case 'product':
                  return (
                    <Card key={`product-${item.id}`} className="overflow-hidden">
                      <div className="p-4">
                        <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                        <p className="text-xl font-bold text-primary mb-4">
                          R$ {item.price.toFixed(2)}
                        </p>
                        {item.images?.length > 0 && (
                          <MediaCarousel
                            images={item.images}
                            videoUrls={[]}
                            title={item.title}
                          />
                        )}
                        <p className="mt-4 text-muted-foreground">{item.description}</p>
                      </div>
                    </Card>
                  );
                case 'event':
                  return <EventCard key={`event-${item.id}`} {...item} />;
                case 'place':
                  return <PlaceCard key={`place-${item.id}`} {...item} />;
                default:
                  return null;
              }
            })}
          </TabsContent>

          <TabsContent value="news">
            <div className="space-y-6">
              {news?.map(item => (
                <NewsCard key={item.id} {...item} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="posts">
            <div className="space-y-6">
              {posts?.map(post => (
                <Card key={post.id} className="overflow-hidden bg-card">
                  <div className="p-4">
                    <div className="flex items-center gap-3 mb-4">
                      <Avatar 
                        className="cursor-pointer hover:opacity-80"
                        onClick={() => navigate(`/perfil/${post.user?.username}`)}
                      >
                        <AvatarImage src={post.user?.avatar_url} />
                        <AvatarFallback>{post.user?.full_name?.[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold">{post.user?.full_name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(post.created_at), "d 'de' MMMM 'às' HH:mm", { locale: ptBR })}
                        </p>
                      </div>
                    </div>
                    <p className="text-foreground mb-4">{post.content}</p>
                    {(post.images?.length > 0 || post.video_urls?.length > 0) && (
                      <MediaCarousel
                        images={post.images || []}
                        videoUrls={post.video_urls || []}
                        title={post.content || ""}
                      />
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="products">
            <div className="space-y-6">
              {products?.map(product => (
                <Card key={product.id} className="overflow-hidden">
                  <div className="p-4">
                    <h3 className="text-xl font-bold mb-2">{product.title}</h3>
                    <p className="text-xl font-bold text-primary mb-4">
                      R$ {product.price.toFixed(2)}
                    </p>
                    {product.images?.length > 0 && (
                      <MediaCarousel
                        images={product.images}
                        videoUrls={[]}
                        title={product.title}
                      />
                    )}
                    <p className="mt-4 text-muted-foreground">{product.description}</p>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="events">
            <div className="space-y-6">
              {events?.map(event => (
                <EventCard key={event.id} {...event} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="places">
            <div className="space-y-6">
              {places?.map(place => (
                <PlaceCard key={place.id} {...place} />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </main>
      <BottomNav />
    </div>
  );
};

export default Feed;
