
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, ChevronLeft, ChevronRight, X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import type { Database } from "@/types/supabase";
import type { InstagramMedia } from "@/types/supabase";

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

type MediaItem = {
  type: "image" | "video";
  url: string;
};

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
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Combine all media into one array
  const allMedia: MediaItem[] = [
    ...(images?.map(url => ({ type: "image" as const, url })) || []),
    ...(video_urls?.map(url => {
      const isYoutubeUrl = url.includes('youtube.com') || url.includes('youtu.be');
      return { 
        type: "video" as const, 
        url: isYoutubeUrl ? url : url.replace('www.dropbox.com', 'dl.dropboxusercontent.com')
      };
    }) || [])
  ];

  const hasMultipleMedia = allMedia.length > 1;
  const currentMedia = allMedia[currentIndex];

  const formattedCreatedAt = createdAt 
    ? format(new Date(createdAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })
    : null;

  const buttonStyle = buttonColor ? {
    background: buttonColor,
    color: '#FFFFFF',
    border: 'none'
  } : undefined;

  const nextMedia = () => {
    setCurrentIndex((prev) => (prev + 1) % allMedia.length);
  };

  const previousMedia = () => {
    setCurrentIndex((prev) => 
      prev === 0 ? allMedia.length - 1 : prev - 1
    );
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const getYoutubeVideoId = (url: string) => {
    if (url.includes('youtu.be')) {
      return url.split('youtu.be/')[1];
    }
    const urlParams = new URLSearchParams(new URL(url).search);
    return urlParams.get('v');
  };

  // Function to transform Instagram URL to embed URL
  const getInstagramEmbed = (url: string, type: 'post' | 'video') => {
    if (!url) return null;

    // Extract Instagram post ID from URL
    const postIdMatch = url.match(/\/p\/([^/?]+)/);
    const reelIdMatch = url.match(/\/reel\/([^/?]+)/);
    const postId = postIdMatch?.[1] || reelIdMatch?.[1];

    if (!postId) return null;

    const embedUrl = `https://www.instagram.com/${type === 'video' ? 'reel' : 'p'}/${postId}/embed`;
    
    return (
      <iframe
        src={embedUrl}
        className="w-full aspect-square"
        frameBorder="0"
        scrolling="no"
        allowTransparency
        allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
      />
    );
  };

  const renderMedia = (mediaItem: MediaItem, isFullscreen: boolean = false) => {
    if (mediaItem.type === 'video') {
      const isYoutubeUrl = mediaItem.url.includes('youtube.com') || mediaItem.url.includes('youtu.be');
      
      if (isYoutubeUrl) {
        const videoId = getYoutubeVideoId(mediaItem.url);
        return (
          <div className={cn(
            "relative w-full h-48",
            isFullscreen && "h-[80vh]"
          )}>
            <iframe
              src={`https://www.youtube.com/embed/${videoId}`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="absolute inset-0 w-full h-full"
            />
          </div>
        );
      } else {
        // For Dropbox videos
        return (
          <div className={cn(
            "relative w-full h-48",
            isFullscreen && "h-[80vh]"
          )}>
            <video
              src={mediaItem.url}
              controls
              className="absolute inset-0 w-full h-full object-contain"
            >
              Seu navegador não suporta a reprodução de vídeos.
            </video>
          </div>
        );
      }
    }

    return (
      <img
        src={mediaItem.url}
        alt={title}
        className={cn(
          "h-full w-full object-cover cursor-pointer",
          isFullscreen ? "max-h-[90vh] max-w-[90vw] object-contain" : "h-48"
        )}
        onClick={toggleFullscreen}
      />
    );
  };

  return (
    <Card className="overflow-hidden transition-transform hover:scale-[1.02]">
      {allMedia.length > 0 && (
        <div className="relative">
          {renderMedia(currentMedia)}
          {hasMultipleMedia && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-2 top-1/2 -translate-y-1/2 text-white hover:bg-black/50"
                onClick={previousMedia}
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-white hover:bg-black/50"
                onClick={nextMedia}
              >
                <ChevronRight className="h-6 w-6" />
              </Button>
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/50 px-3 py-1 rounded-full text-white text-sm">
                {currentIndex + 1} / {allMedia.length}
              </div>
            </>
          )}
        </div>
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

      {/* Instagram Media Section */}
      {instagramMedia && instagramMedia.length > 0 && (
        <div className="space-y-4">
          {instagramMedia.map((media, index) => (
            <div key={index}>
              {getInstagramEmbed(media.url, media.type)}
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};

export default NewsCard;
