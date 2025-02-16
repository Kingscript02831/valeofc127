
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import MediaCarousel from "./MediaCarousel";

interface InstagramMedia {
  url: string;
  type: 'post' | 'video';
}

interface NewsCardProps {
  title: string;
  content: string;
  date?: string;
  createdAt?: string;
  buttonColor?: string;
  buttonSecondaryColor?: string;
  category?: {
    name: string;
    slug?: string;
    background_color?: string;
  } | null;
  images?: string[];
  video_urls?: string[];
  instagramMedia?: InstagramMedia[];
}

const NewsCard = ({
  title,
  content,
  date,
  createdAt,
  buttonColor,
  category,
  images = [],
  video_urls = [],
  instagramMedia = []
}: NewsCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [processedInstagramUrls, setProcessedInstagramUrls] = useState<string[]>([]);

  useEffect(() => {
    if (instagramMedia && instagramMedia.length > 0) {
      const urls = instagramMedia.map(media => {
        let url = media.url;
        
        // Remove parâmetros e trailing slashes
        url = url.split('?')[0].replace(/\/+$/, '');
        
        // Garantir que a URL começa com https://
        if (!url.startsWith('http')) {
          url = 'https://' + url;
        }
        
        // Remover www. se existir
        url = url.replace('www.', '');
        
        // Transformar URLs de reel em post
        url = url.replace('/reel/', '/p/');
        
        // Garantir que termina com /embed
        if (!url.endsWith('/embed')) {
          url = url + '/embed';
        }

        // Adicionar parâmetros necessários
        url = `${url}?cr=1&v=14&wp=540&rd=https%3A%2F%2Finstagram.com`;

        return url;
      });
      
      console.log('Processed Instagram URLs:', urls);
      setProcessedInstagramUrls(urls);
    }
  }, [instagramMedia]);

  const formattedCreatedAt = createdAt 
    ? format(new Date(createdAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })
    : null;

  const buttonStyle = buttonColor ? {
    background: buttonColor,
    color: '#FFFFFF',
    border: 'none'
  } : undefined;

  // Handle both Dropbox and YouTube videos
  const processedVideoUrls = video_urls?.map(url => {
    if (url.includes('dropbox.com')) {
      return url.replace('www.dropbox.com', 'dl.dropboxusercontent.com');
    }
    return url;
  }) || [];

  return (
    <Card className="overflow-hidden transition-transform hover:scale-[1.02]">
      {/* Instagram Media Section - Moved to top */}
      {processedInstagramUrls.length > 0 && (
        <div className="space-y-4">
          {processedInstagramUrls.map((url, index) => (
            <div key={index} className="aspect-square w-full bg-gray-50">
              <iframe
                key={url}
                src={url}
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

      {/* Media Carousel Section */}
      {(images?.length > 0 || processedVideoUrls.length > 0) && (
        <MediaCarousel 
          images={images}
          videoUrls={processedVideoUrls}
          title={title}
        />
      )}

      <div className="p-4">
        <h3 className="text-xl font-bold mb-2">{title}</h3>

        {category && (
          <span 
            className="inline-block px-2 py-0.5 rounded-full text-xs mb-2"
            style={{
              backgroundColor: category.background_color ? `${category.background_color}40` : '#D6BCFA40',
              color: category.background_color || '#1A1F2C'
            }}
          >
            {category.name}
          </span>
        )}

        {formattedCreatedAt && (
          <div className="text-xs text-gray-500 mb-2">
            Publicado em {formattedCreatedAt}
          </div>
        )}

        <div className={cn("prose prose-sm max-w-none", !isExpanded && "line-clamp-3")}>
          {content.split('\n').map((paragraph, index) => (
            paragraph.trim() ? <p key={index} className="mb-2">{paragraph}</p> : null
          ))}
        </div>

        <Button
          variant="ghost"
          className="mt-2 w-full flex items-center justify-center gap-1 text-sm hover:bg-gray-100"
          onClick={() => setIsExpanded(!isExpanded)}
          style={buttonStyle}
        >
          {isExpanded ? (
            <>
              Ver menos
              <ChevronUp className="h-4 w-4" />
            </>
          ) : (
            <>
              Ver mais
              <ChevronDown className="h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </Card>
  );
};

export default NewsCard;
