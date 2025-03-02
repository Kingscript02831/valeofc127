
import React, { useState, useEffect } from "react";
import SubNav from "@/components/SubNav";
import StoriesRow from "@/components/StoriesRow";
import { supabase } from "@/integrations/supabase/client";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { PostsMenu } from "@/components/PostsMenu";
import Locpost from "@/components/locpost";
import type { Post } from "@/types/posts";

export default function Posts() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("posts")
          .select(`
            *,
            profiles:user_id (*)
          `)
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Error fetching posts:", error.message);
          return;
        }

        if (data) {
          const formattedPosts = data.map((post) => {
            return {
              id: post.id,
              content: post.content,
              user_id: post.user_id,
              created_at: post.created_at,
              location: post.location || null,
              images: post.images || [],
              username: post.profiles?.username || "Usuário",
              avatar_url: post.profiles?.avatar_url || "/placeholder.svg",
              location_name: post.location_name || null,
              view_count: post.view_count || 0,
              comment_count: post.comment_count || 0,
              is_verified: post.profiles?.is_verified || false
            } as Post;
          });
          setPosts(formattedPosts);
        }
      } catch (err) {
        console.error("Unexpected error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  return (
    <div>
      <Navbar />
      <SubNav />
      <div className="container mx-auto px-2 pb-20">
        <StoriesRow />

        {loading ? (
          <div className="flex justify-center mt-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
          </div>
        ) : (
          <div className="mt-4 space-y-6">
            {posts.map((post) => (
              <Locpost key={post.id} post={post} />
            ))}
          </div>
        )}
      </div>
      <PostsMenu />
      <Footer />
    </div>
  );
}
