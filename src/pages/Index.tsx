
import { useState } from "react";
import Navbar from "@/components/Navbar";
import SubNav from "@/components/SubNav";
import Footer from "@/components/Footer";
import BottomNav from "@/components/BottomNav";
import PostCard from "@/components/PostCard";
import CreatePostDialog from "@/components/CreatePostDialog";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const { data: posts = [], isLoading } = useQuery({
    queryKey: ['posts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching posts:', error);
        throw error;
      }
      
      return data || [];
    }
  });

  return (
    <div className="min-h-screen flex flex-col pb-[72px] md:pb-0">
      <Navbar />
      <SubNav />
      <main className="flex-1 container mx-auto py-8 px-4">
        <div className="flex flex-col gap-8 max-w-xl mx-auto">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">Feed</h1>
            <CreatePostDialog />
          </div>
          
          {isLoading ? (
            <p className="text-center py-8">Carregando posts...</p>
          ) : posts.length === 0 ? (
            <p className="text-center py-8 text-gray-500">
              Nenhum post encontrado. Seja o primeiro a postar!
            </p>
          ) : (
            posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))
          )}
        </div>
      </main>
      <Footer />
      <BottomNav />
    </div>
  );
};

export default Index;
