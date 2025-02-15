
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface InstagramMedia {
  url: string;
  type: 'post' | 'video';
}

interface NewsCardProps {
  title: string;
  content: string;
  image?: string;
  video?: string;
  date?: string;
  createdAt?: string;
  buttonColor?: string;
  buttonSecondaryColor?: string;
  category?: {
    name: string;
    slug?: string;
    background_color?: string;
  } | null;
  instagramMedia?: InstagramMedia[];
}

const NewsCard = ({
  title,
  content,
  image,
  video,
  createdAt,
  buttonColor,
  buttonSecondaryColor,
  category,
  instagramMedia = []
}: NewsCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const formattedCreatedAt = createdAt 
    ? format(new Date(createdAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })
    : null;

  const buttonStyle = buttonColor ? {
    background: buttonSecondaryColor 
      ? `linear-gradient(to right, ${buttonColor}, ${buttonSecondaryColor})`
      : buttonColor,
    color: '#FFFFFF',
    border: 'none'
  } : undefined;

  // Function to transform YouTube URL to embed URL
  const getEmbedUrl = (url: string) => {
    if (!url) return '';
    
    // Handle different YouTube URL formats
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    
    if (match && match[2].length === 11) {
      return `https://www.youtube.com/embed/${match[2]}`;
    }
    
    return url;
  };

  // Function to get Instagram embed HTML
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

  return (
    <Card className="overflow-hidden transition-transform hover:scale-[1.02]">
      {image && (
        <div className="relative">
          <img
            src={image}
            alt={title}
            className="w-full object-contain"
          />
        </div>
      )}
      {video && (
        <div className="relative aspect-video">
          <iframe
            src={getEmbedUrl(video)}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full"
          />
        </div>
      )}
      {/* Instagram Media Section - Moved to top */}
      {instagramMedia && instagramMedia.length > 0 && (
        <div className="space-y-4">
          {instagramMedia.map((media, index) => (
            <div key={index}>
              {getInstagramEmbed(media.url, media.type)}
            </div>
          ))}
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
    </Card>
  );
};

export default NewsCard;
