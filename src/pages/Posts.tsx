
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import NewsCard from "@/components/NewsCard";

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
  const navigate = useNavigate();
  
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

      // Fetch likes for current user if logged in
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
          <NewsCard
            key={post.id}
            id={post.id}
            title={post.user.username}
            content={post.content}
            createdAt={post.created_at}
            images={post.images}
            video_urls={post.video_urls}
          />
        ))}
      </div>
    </div>
  );
}
