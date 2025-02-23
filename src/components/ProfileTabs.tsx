
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Profile } from "@/types/profile";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import MediaCarousel from "@/components/MediaCarousel";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Post {
  id: string;
  content: string;
  images: string[];
  video_urls: string[];
  created_at: string;
}

interface ProfileTabsProps {
  profile: Profile;
}

const ProfileTabs = ({ profile }: ProfileTabsProps) => {
  // Fetch posts
  const { data: posts } = useQuery({
    queryKey: ["profile-posts", profile.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .eq("user_id", profile.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Post[];
    },
  });

  return (
    <Tabs defaultValue="posts" className="w-full">
      <TabsList className="w-full">
        <TabsTrigger value="posts" className="flex-1">Posts</TabsTrigger>
        <TabsTrigger value="reels" className="flex-1">Reels</TabsTrigger>
        <TabsTrigger value="products" className="flex-1">Produtos</TabsTrigger>
      </TabsList>

      <TabsContent value="posts" className="mt-4">
        <ScrollArea className="h-[calc(100vh-400px)]">
          {!posts?.length ? (
            <div className="text-center text-muted-foreground p-4">
              Ainda não há Posts
            </div>
          ) : (
            <div className="space-y-4 p-4">
              {posts.map((post) => (
                <Card key={post.id} className="p-4">
                  {(post.images?.length > 0 || post.video_urls?.length > 0) && (
                    <div className="mb-4">
                      <MediaCarousel
                        images={post.images || []}
                        videoUrls={post.video_urls || []}
                        title={post.content}
                        showControls
                      />
                    </div>
                  )}
                  <p className="text-foreground">{post.content}</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    {formatDistanceToNow(new Date(post.created_at), {
                      addSuffix: true,
                      locale: ptBR,
                    })}
                  </p>
                </Card>
              ))}
            </div>
          )}
        </ScrollArea>
      </TabsContent>

      <TabsContent value="reels" className="mt-4">
        <div className="text-center text-muted-foreground p-4">
          Ainda não há Reels
        </div>
      </TabsContent>

      <TabsContent value="products" className="mt-4">
        <div className="text-center text-muted-foreground p-4">
          Ainda não há Produtos
        </div>
      </TabsContent>
    </Tabs>
  );
};

export default ProfileTabs;
