
import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "../integrations/supabase/client";
import type { Database } from "../integrations/supabase/types";
import { toast } from "sonner";
import { ChevronLeft } from "lucide-react";
import { Button } from "../components/ui/button";
import MediaCarousel from "../components/MediaCarousel";
import Navbar from "../components/Navbar";
import SubNav from "../components/SubNav";
import Footer from "../components/Footer";
import BottomNav from "../components/BottomNav";

type News = Database["public"]["Tables"]["news"]["Row"] & {
  categories: Database["public"]["Tables"]["categories"]["Row"] | null;
};

export default function NewsDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Detalhes da Notícia | Vale Notícias";
  }, []);

  const { data: news, isLoading } = useQuery({
    queryKey: ["news", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("news")
        .select("*, categories(*)")
        .eq("id", id)
        .single();

      if (error) {
        console.error("Error fetching news:", error);
        toast.error("Erro ao carregar notícia");
        return null;
      }

      return data as News;
    },
  });

  const parseVideoUrls = (urls: string[] | null) => {
    if (!urls) return [];
    return urls.map(url => {
      if (url.includes('dropbox.com')) {
        return url.replace('www.dropbox.com', 'dl.dropboxusercontent.com');
      }
      return url;
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <SubNav />
        <main className="flex-1 container mx-auto py-8 px-4">
          <div className="animate-pulse">
            <div className="h-48 bg-gray-200 rounded-lg mb-4"></div>
            <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        </main>
        <Footer />
        <BottomNav />
      </div>
    );
  }

  if (!news) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <SubNav />
        <main className="flex-1 container mx-auto py-8 px-4">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Notícia não encontrada</h1>
            <Button 
              variant="outline" 
              onClick={() => navigate(-1)}
              className="flex items-center gap-2"
            >
              <ChevronLeft className="h-4 w-4" />
              Voltar
            </Button>
          </div>
        </main>
        <Footer />
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col pb-[72px] md:pb-0">
      <Navbar />
      <SubNav />
      <main className="flex-1 container mx-auto py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <Button 
            variant="outline" 
            onClick={() => navigate(-1)}
            className="mb-6 flex items-center gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            Voltar
          </Button>

          {(news.images?.length > 0 || news.video_urls?.length > 0) && (
            <div className="mb-6">
              <MediaCarousel 
                images={news.images || []}
                videoUrls={parseVideoUrls(news.video_urls)}
                title={news.title}
              />
            </div>
          )}

          <div className="space-y-4">
            <h1 className="text-4xl font-bold">{news.title}</h1>
            
            {news.categories && (
              <span 
                className="inline-block px-3 py-1 rounded-full text-sm"
                style={{
                  backgroundColor: news.categories.background_color ? `${news.categories.background_color}40` : '#D6BCFA40',
                  color: news.categories.background_color || '#1A1F2C'
                }}
              >
                {news.categories.name}
              </span>
            )}

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <time dateTime={news.date}>
                {new Date(news.date).toLocaleDateString('pt-BR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </time>
            </div>

            <div className="prose prose-lg max-w-none dark:prose-invert">
              {news.content.split('\n').map((paragraph, index) => (
                paragraph.trim() ? <p key={index}>{paragraph}</p> : null
              ))}
            </div>
          </div>
        </div>
      </main>
      <Footer />
      <BottomNav />
    </div>
  );
}
