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
import { toast } from "sonner";
import type { Database } from "@/integrations/supabase/types";

type News = Database['public']['Tables']['news']['Row'] & {
  categories: Database['public']['Tables']['categories']['Row'] | null;
};
type Category = Database['public']['Tables']['categories']['Row'];
type File = Database['public']['Tables']['files']['Row'];
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
      if (error) {
        console.error('Error fetching categories:', error);
        toast.error('Erro ao carregar categorias');
        throw error;
      }
      return data || [];
    }
  });

  const { data: files = [] } = useQuery<File[]>({
    queryKey: ['files'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('files')
        .select('*')
        .or('file_type.eq.image,file_type.eq.video')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching files:', error);
        toast.error('Erro ao carregar arquivos');
        throw error;
      }

      console.log('Fetched files:', data);
      return data || [];
    }
  });

  const { data: news = [], isLoading, error } = useQuery<News[]>({
    queryKey: ['news', searchTerm, selectedCategory],
    queryFn: async () => {
      try {
        let query = supabase
          .from('news')
          .select('*, categories(*)')
          .order('date', { ascending: false });

        if (searchTerm) {
          query = query.ilike('title', `%${searchTerm}%`);
        }

        if (selectedCategory) {
          query = query.eq('category_id', selectedCategory);
        }

        const { data, error } = await query;
        
        if (error) {
          console.error('Supabase query error:', error);
          toast.error('Erro ao carregar notícias');
          throw error;
        }
        
        console.log('Fetched news data:', data);
        return data as News[];
      } catch (err) {
        console.error('Error fetching news:', err);
        toast.error('Erro ao carregar notícias');
        throw err;
      }
    },
    retry: 1
  });

  return (
    <div className="min-h-screen flex flex-col pb-[72px] md:pb-0">
      <Navbar />
      <SubNav />
      <main className="flex-1 container mx-auto py-8 px-4">
        <div className="flex flex-col gap-8">
          {files.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold mb-4">Arquivos de Mídia</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {files.map((file) => (
                  <div key={file.id} className="relative group">
                    {file.file_type.includes('image') ? (
                      <img
                        src={file.file_path}
                        alt={file.file_name}
                        className="w-full h-48 object-cover rounded-lg"
                      />
                    ) : (
                      <video
                        src={file.file_path}
                        className="w-full h-48 object-cover rounded-lg"
                        controls
                      />
                    )}
                    <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white p-2 text-sm truncate rounded-b-lg">
                      {file.file_name}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

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

          <div className="flex gap-2 overflow-x-auto pb-4 mb-6 scrollbar-hide">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-4 py-2 rounded-full text-sm whitespace-nowrap transition-colors ${
                !selectedCategory
                  ? "bg-[#F1F1F1] text-gray-800 dark:bg-gray-700 dark:text-white"
                  : "bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-200"
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
                    ? "bg-[#F1F1F1] text-gray-800 dark:bg-gray-700 dark:text-white"
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
          ) : error ? (
            <p className="text-center py-8 text-red-500">
              Erro ao carregar notícias. Por favor, tente novamente.
            </p>
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
                    date={item.date}
                    file_path={item.file_path || undefined}
                    video={item.video || undefined}
                    instagramMedia={instagramMedia}
                    category={item.categories ? {
                      name: item.categories.name,
                      slug: item.categories.slug
                    } : undefined}
                    buttonColor={item.button_color || undefined}
                    createdAt={item.created_at}
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
