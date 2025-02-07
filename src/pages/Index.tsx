
import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import NewsCard from "@/components/NewsCard";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import type { Database } from "@/integrations/supabase/types";

type News = Database['public']['Tables']['news']['Row'] & {
  categories?: Database['public']['Tables']['categories']['Row'];
};

const Index = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const { data: news = [], error, isLoading } = useQuery<News[]>({
    queryKey: ['news', searchTerm],
    queryFn: async () => {
      console.log('Fetching news with searchTerm:', searchTerm);
      try {
        const { data, error } = await supabase
          .from('news')
          .select(`
            *,
            categories (*)
          `)
          .ilike('title', `%${searchTerm}%`)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Supabase query error:', error);
          throw error;
        }

        console.log('Fetched news data:', data);
        return data || [];
      } catch (err) {
        console.error('Error fetching news:', err);
        throw err;
      }
    }
  });

  if (error) {
    console.error('React Query error:', error);
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 container mx-auto py-8 px-4">
        <div className="flex flex-col gap-8">
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-bold">Últimas Notícias</h1>
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500 h-4 w-4" />
              <Input
                type="search"
                placeholder="Buscar notícias..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          {isLoading ? (
            <p className="text-center py-8">Carregando notícias...</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {news.map((item) => {
                const instagramMedia = Array.isArray(item.instagram_media) 
                  ? (item.instagram_media as unknown as InstagramMedia[])
                  : [];
                  
                return (
                  <NewsCard
                    key={item.id}
                    title={item.title}
                    content={item.content}
                    date={new Date(item.date).toLocaleDateString("pt-BR")}
                    image={item.image || undefined}
                    video={item.video || undefined}
                    instagramMedia={instagramMedia}
                    buttonColor={item.button_color || undefined}
                    category={item.categories ? {
                      name: item.categories.name,
                      slug: item.categories.slug
                    } : undefined}
                  />
                );
              })}
              {!isLoading && news.length === 0 && (
                <p className="text-gray-500 col-span-full text-center py-8">
                  Nenhuma notícia encontrada.
                </p>
              )}
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
