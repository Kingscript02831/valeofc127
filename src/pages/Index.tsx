
import { useState } from "react";
import Navbar from "@/components/Navbar";
import SubNav from "@/components/SubNav";
import Footer from "@/components/Footer";
import NewsCard from "@/components/NewsCard";
import BottomNav from "@/components/BottomNav";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import type { Database } from "@/integrations/supabase/types";

type News = Database['public']['Tables']['news']['Row'] & {
  categories: Database['public']['Tables']['categories']['Row'] | null;
};
type Category = Database['public']['Tables']['categories']['Row'];
interface InstagramMedia {
  url: string;
  type: 'post' | 'video';
}

const Index = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ['categories', 'news'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('page_type', 'news')
        .order('name');
      if (error) throw error;
      return data || [];
    }
  });

  const { data: news = [], error, isLoading } = useQuery<News[]>({
    queryKey: ['news', searchTerm, selectedCategory],
    queryFn: async () => {
      try {
        let query = supabase
          .from('news')
          .select('*, categories!news_category_id_fkey(*)');

        if (searchTerm) {
          query = query.ilike('title', `%${searchTerm}%`);
        }

        if (selectedCategory) {
          query = query.eq('category_id', selectedCategory);
        }

        query = query.order('date', { ascending: false });

        const { data, error } = await query;
        
        if (error) {
          console.error('Supabase query error:', error);
          throw error;
        }
        
        console.log('Fetched news data:', data);
        return data as News[];
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
    <div className="min-h-screen flex flex-col pb-[72px] md:pb-0">
      <Navbar />
      <SubNav />
      <main className="flex-1 container mx-auto py-8 px-4">
        <div className="flex flex-col gap-8">
          <h1 className="text-3xl font-bold">Últimas Notícias</h1>
          
          <div className="flex flex-col sm:flex-row gap-4">
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

          {/* Categories Section */}
          <div className="flex gap-2 overflow-x-auto pb-4 mb-6 scrollbar-hide">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-4 py-2 rounded-full text-sm whitespace-nowrap transition-colors ${
                !selectedCategory
                  ? "bg-[#F1F1F1] text-gray-800"
                  : "bg-gray-100 hover:bg-gray-200"
              }`}
            >
              Todas
            </button>
            {categories?.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-full text-sm whitespace-nowrap transition-colors ${
                  selectedCategory === category.id
                    ? "bg-[#F1F1F1] text-gray-800"
                    : "hover:opacity-80"
                }`}
                style={{
                  backgroundColor:
                    selectedCategory === category.id
                      ? "#F1F1F1"
                      : category.background_color + "40" || "#D6BCFA40",
                }}
              >
                {category.name}
              </button>
            ))}
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
                    category={item.categories ? {
                      name: item.categories.name,
                      slug: item.categories.slug
                    } : undefined}
                    buttonColor={item.button_color || undefined}
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
      <BottomNav />
    </div>
  );
};

export default Index;
