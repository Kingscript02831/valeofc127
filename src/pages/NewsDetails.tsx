
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import MediaCarousel from "@/components/MediaCarousel";
import type { Database } from "@/types/supabase";
import { useQuery } from "@tanstack/react-query";

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

      if (error) throw error;
      if (!data) throw new Error("Notícia não encontrada");

      return data as News;
    },
    onError: (error) => {
      console.error("Error fetching news:", error);
      toast.error("Erro ao carregar a notícia");
    }
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

      if (error) throw error;
      return data as Category;
    },
    onError: (error) => {
      console.error("Error fetching category:", error);
    }
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

  if (isLoadingNews || !news) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-8"></div>
          <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        </div>
      </div>
    );
  }

  const formattedDate = format(new Date(news.date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">{news.title}</h1>
            <div className="flex items-center gap-3">
              {category && (
                <Badge
                  style={{
                    backgroundColor: category.background_color ? `${category.background_color}40` : '#D6BCFA40',
                    color: category.background_color || '#1A1F2C'
                  }}
                >
                  {category.name}
                </Badge>
              )}
              <span className="text-sm text-gray-500">{formattedDate}</span>
            </div>
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={handleShare}
            className="rounded-full"
          >
            <Share2 className="h-4 w-4" />
          </Button>
        </div>

        {(news.images?.length > 0 || news.video_urls?.length > 0) && (
          <div className="mb-6">
            <MediaCarousel
              images={news.images || []}
              videoUrls={news.video_urls || []}
              title={news.title}
            />
          </div>
        )}

        {news.instagram_media && news.instagram_media.length > 0 && (
          <div className="mb-6 space-y-4">
            {news.instagram_media.map((media, index) => (
              <div key={index} className="aspect-square w-full bg-gray-50">
                <iframe
                  src={media.url}
                  className="w-full h-full"
                  frameBorder="0"
                  scrolling="no"
                  allowTransparency
                  allow="encrypted-media; picture-in-picture; web-share"
                  loading="lazy"
                  referrerPolicy="origin"
                  title={`Instagram post ${index + 1}`}
                />
              </div>
            ))}
          </div>
        )}

        <div className="prose prose-lg max-w-none">
          {news.content.split('\n').map((paragraph, index) => (
            paragraph.trim() ? <p key={index}>{paragraph}</p> : null
          ))}
        </div>
      </div>
    </div>
  );
};

export default NewsDetails;
