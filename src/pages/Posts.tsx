
import { useQuery } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";
import { Plus } from "lucide-react";
import { Button } from "../components/ui/button";
import { Link } from "react-router-dom";
import { Card } from "../components/ui/card";

interface Post {
  id: string;
  user_id: string;
  content: string;
  images: string[];
  video_urls: string[];
  likes: number;
  created_at: string;
  user_has_liked?: boolean;
  comments: Comment[];
  user: {
    username: string;
    avatar_url: string;
  };
}

export default function Posts() {
  const { data: posts, isLoading } = useQuery({
    queryKey: ["posts"],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();

      const { data: postsData, error } = await supabase
        .from("posts")
        .select(`
          *,
          user:profiles(username, avatar_url),
          comments:post_comments(
            id,
            content,
            created_at,
            user:profiles(username, avatar_url)
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;

      if (session) {
        const { data: userLikes } = await supabase
          .from("post_likes")
          .select("post_id")
          .eq("user_id", session.user.id);

        return postsData.map(post => ({
          ...post,
          user_has_liked: userLikes?.some(like => like.post_id === post.id) || false,
        }));
      }

      return postsData;
    },
  });

  if (isLoading) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Posts</h1>
        <Button asChild>
          <Link to="/posts/new" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Novo Post
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {posts?.map((post) => (
          <Card key={post.id} className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="font-semibold">{post.user.username}</div>
            </div>
            <p className="text-sm text-gray-600 mb-4">{post.content}</p>
            {post.images && post.images.length > 0 && (
              <div className="aspect-video relative overflow-hidden rounded-lg mb-4">
                <img 
                  src={post.images[0]} 
                  alt="Post content"
                  className="object-cover w-full h-full"
                />
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
