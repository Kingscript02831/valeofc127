
import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import NewsCard from "@/components/NewsCard";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import type { Database } from "@/integrations/supabase/types";

type News = Database['public']['Tables']['news']['Row'];
interface InstagramMedia {
  url: string;
  type: 'post' | 'video';
}

const Index = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const { data: news = [] } = useQuery<News[]>({
    queryKey: ['news', searchTerm],
    queryFn: async () => {
      let query = supabase
        .from('news')
        .select('*')
        .order('created_at', { ascending: false });

      if (searchTerm) {
        query = query.ilike('title', `%${searchTerm}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    }
  });

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
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {news.map((item) => (
              <NewsCard
                key={item.id}
                title={item.title}
                content={item.content}
                date={new Date(item.date).toLocaleDateString("pt-BR")}
                image={item.image || undefined}
                video={item.video || undefined}
                instagramMedia={(item.instagram_media as InstagramMedia[]) || []}
              />
            ))}
            {news.length === 0 && (
              <p className="text-gray-500 col-span-full text-center py-8">
                Nenhuma notícia encontrada.
              </p>
            )}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
