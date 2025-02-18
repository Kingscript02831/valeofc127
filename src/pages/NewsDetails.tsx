
import { useParams } from "react-router-dom";
import { supabase } from "../integrations/supabase/client";
import { Share2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import MediaCarousel from "../components/MediaCarousel";
import type { Database } from "../types/supabase";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import SubNav from "../components/SubNav";
import BottomNav from "../components/BottomNav";

type News = Database['public']['Tables']['news']['Row'];
type Category = Database['public']['Tables']['categories']['Row'];

const NewsDetails = () => {
  const { id } = useParams();

  const { data: news, isLoading: isLoadingNews } = useQuery({
    queryKey: ['news', id],
    queryFn: async () => {
      if (!id) {
        throw new Error("ID da notícia não encontrado");
      }

      const { data, error } = await supabase
        .from("news")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error("Supabase error:", error);
        throw error;
      }
      
      if (!data) {
        throw new Error("Notícia não encontrada");
      }

      return data as News;
    },
  });

  const { data: category } = useQuery({
    queryKey: ['category', news?.category_id],
    enabled: !!news?.category_id,
    queryFn: async () => {
      if (!news?.category_id) return null;

      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .eq("id", news.category_id)
        .single();

      if (error) {
        console.error("Category fetch error:", error);
        throw error;
      }
      return data as Category;
    },
  });

  const handleShare = async () => {
    if (!news) return;

    try {
      if (navigator.share) {
        await navigator.share({
          title: news.title,
          text: news.content,
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast.success("Link copiado para a área de transferência!");
      }
    } catch (error) {
      console.error("Error sharing:", error);
      toast.error("Erro ao compartilhar");
    }
  };

  if (isLoadingNews) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <SubNav />
        <div className="container mx-auto px-4 py-8 flex-1">
          <div className="animate-pulse max-w-4xl mx-auto">
            <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        </div>
        <BottomNav />
      </div>
    );
  }

  if (!news) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <SubNav />
        <div className="container mx-auto px-4 py-8 text-center flex-1">
          <h1 className="text-2xl font-bold mb-4">Notícia não encontrada</h1>
          <p className="text-gray-600">A notícia que você está procurando não existe ou foi removida.</p>
        </div>
        <BottomNav />
      </div>
    );
  }

  const formattedDate = format(new Date(news.date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });

  // Prepare all media for the carousel
  const allMedia = [
    ...(news.images || []),
    ...(news.video_urls || []),
    ...(news.instagram_media?.map(media => 
      typeof media === 'string' ? media : media.url
    ) || [])
  ].filter(Boolean);

  return (
    <div className="min-h-screen flex flex-col pb-[72px] md:pb-0">
      <Navbar />
      <SubNav />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-3xl mx-auto">
            <div className="mb-8 space-y-6 animate-fade-in">
              {/* Back button and Share button */}
              <div className="flex items-center justify-between">
                <Link
                  to="/"
                  className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Voltar</span>
                </Link>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleShare}
                  className="rounded-full hover:scale-105 transition-all duration-300 shadow-lg"
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Compartilhar
                </Button>
              </div>

              {/* Title and metadata */}
              <div className="space-y-4">
                <h1 className="text-2xl md:text-3xl font-bold leading-tight animate-slide-in-right">
                  {news.title}
                </h1>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  {category && (
                    <Badge
                      className="transition-all duration-300 hover:scale-105"
                      style={{
                        backgroundColor: category.background_color ? `${category.background_color}40` : '#D6BCFA40',
                        color: category.background_color || '#1A1F2C'
                      }}
                    >
                      {category.name}
                    </Badge>
                  )}
                  <span>{formattedDate}</span>
                </div>
              </div>

              {/* All media in one carousel */}
              {allMedia.length > 0 && (
                <div className="rounded-2xl overflow-hidden shadow-xl transition-transform hover:scale-[1.01] duration-300">
                  <MediaCarousel
                    images={news.images || []}
                    videoUrls={news.video_urls || []}
                    instagramUrls={news.instagram_media?.map(media => 
                      typeof media === 'string' ? media : media.url
                    ) || []}
                    title={news.title}
                  />
                </div>
              )}

              {/* Content with proper formatting */}
              <div className="prose prose-lg max-w-none">
                {news.content.split('\n').map((paragraph, index) => (
                  paragraph.trim() ? (
                    <p 
                      key={index}
                      className="animate-fade-in whitespace-pre-line text-base leading-relaxed mb-4"
                      style={{
                        animationDelay: `${index * 100}ms`
                      }}
                    >
                      {paragraph}
                    </p>
                  ) : <br key={index} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
      <BottomNav />
    </div>
  );
};

export default NewsDetails;
