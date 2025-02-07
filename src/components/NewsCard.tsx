
import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface InstagramMedia {
  url: string;
  type: 'post' | 'video';
}

interface NewsCardProps {
  title: string;
  content: string;
  date: string;
  image?: string;
  video?: string;
  instagramMedia?: InstagramMedia[];
  buttonColor?: string;
  buttonSecondaryColor?: string;
  category?: {
    name: string;
    slug: string;
  };
}

const getYouTubeEmbedUrl = (url: string) => {
  if (!url) return '';
  
  const watchMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
  if (watchMatch) {
    return `https://www.youtube.com/embed/${watchMatch[1]}`;
  }
  return url;
};

const getInstagramEmbedUrl = (url: string) => {
  if (!url) return '';
  url = url.split('?')[0].replace(/\/$/, '');
  const idMatch = url.match(/(?:\/reel\/|\/p\/)([^\/]+)/);
  if (!idMatch) return '';
  const postId = idMatch[1];
  const isReel = url.includes('/reel/');
  return isReel 
    ? `https://www.instagram.com/reel/${postId}/embed`
    : `https://www.instagram.com/p/${postId}/embed`;
};

const NewsCard = ({ 
  title, 
  content, 
  date, 
  image, 
  video, 
  instagramMedia = [], 
  buttonColor,
  buttonSecondaryColor,
  category 
}: NewsCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const youtubeEmbedUrl = getYouTubeEmbedUrl(video || '');

  const formattedContent = content.split('\n').map((paragraph, index) => (
    paragraph.trim() ? <p key={index} className="mb-4">{paragraph}</p> : null
  ));

  const buttonStyle = buttonColor ? {
    background: buttonSecondaryColor 
      ? `linear-gradient(to right, ${buttonColor}, ${buttonSecondaryColor})`
      : buttonColor,
    color: '#FFFFFF',
    border: 'none'
  } : undefined;

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {video && (
        <div className="aspect-video">
          <iframe
            src={youtubeEmbedUrl}
            className="w-full h-full"
            allowFullScreen
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            title={title}
          />
        </div>
      )}
      
      {!video && image && (
        <img
          src={image}
          alt={title}
          className="w-full h-48 object-cover"
        />
      )}
      
      <div className="p-4">
        <div className="flex items-center gap-2 mb-2">
          {category && (
            <Badge variant="secondary" className="text-xs">
              {category.name}
            </Badge>
          )}
          <p className="text-sm text-gray-500">{date}</p>
        </div>
        
        <h2 className="text-xl font-semibold mb-2">{title}</h2>
        
        <div className={cn("prose prose-sm max-w-none", !isExpanded && "line-clamp-3")}>
          {formattedContent}
        </div>

        {instagramMedia && instagramMedia.length > 0 && (
          <div className="mt-4 space-y-4">
            {instagramMedia.map((media, index) => (
              <div key={index} className="instagram-embed aspect-[5/6]">
                <iframe
                  src={getInstagramEmbedUrl(media.url)}
                  className="w-full h-full"
                  frameBorder="0"
                  scrolling="no"
                  allowTransparency
                  allowFullScreen
                />
              </div>
            ))}
          </div>
        )}
        
        <Button
          variant="ghost"
          className={cn(
            "mt-2 w-full flex items-center justify-center gap-2 transition-colors",
            buttonColor && "text-white hover:text-white hover:opacity-90"
          )}
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
    </div>
  );
};

export default NewsCard;
