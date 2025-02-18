
import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import MediaCarousel from "@/components/MediaCarousel";

interface Category {
  id: string;
  name: string;
  background_color?: string;
}

interface InstagramMedia {
  url: string;
  type: 'post' | 'video';
}

interface News {
  id: string;
  title: string;
  content: string;
  date: string;
  category_id: string | null;
  images: string[] | null;
  video_urls: string[] | null;
  button_color: string | null;
  instagram_media: InstagramMedia[] | null;
}

const NewsDetails = () => {
  const { id } = useParams();
  const [news, setNews] = useState<News | null>(null);
  const [category, setCategory] = useState<Category | null>(null);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const { data: newsData, error: newsError } = await supabase
          .from("news")
          .select("*")
          .eq("id", id)
          .single();

        if (newsError) throw newsError;
        setNews(newsData);

        if (newsData.category_id) {
          const { data: categoryData, error: categoryError } = await supabase
            .from("categories")
            .select("*")
            .eq("id", newsData.category_id)
            .single();

          if (categoryError) throw categoryError;
          setCategory(categoryData);
        }
      } catch (error) {
        console.error("Error fetching news:", error);
        toast.error("Erro ao carregar a notícia");
      }
    };

    if (id) {
      fetchNews();
    }
  }, [id]);

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

  if (!news) {
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
