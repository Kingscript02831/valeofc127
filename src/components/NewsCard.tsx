
import { useState } from "react";
import { ChevronDown, ChevronUp, Calendar } from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";

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
  category?: {
    name: string;
    slug: string;
  };
}

const NewsCard = ({ 
  title, 
  content, 
  date, 
  image, 
  video,
  instagramMedia = [],
  buttonColor,
  category 
}: NewsCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getYouTubeEmbedUrl = (url: string) => {
    if (!url) return '';
    const watchMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
    return watchMatch ? `https://www.youtube.com/embed/${watchMatch[1]}` : url;
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {video && (
        <div className="aspect-video">
          <iframe
            src={getYouTubeEmbedUrl(video)}
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
          <div className="flex items-center gap-1 text-sm text-gray-500">
            <Calendar className="h-4 w-4" />
            <span>{date}</span>
          </div>
        </div>
        
        <h2 className="text-xl font-semibold mb-2">{title}</h2>
        
        <div className={`prose prose-sm max-w-none ${!isExpanded && "line-clamp-3"}`}>
          {content.split('\n').map((paragraph, index) => (
            paragraph.trim() ? <p key={index} className="mb-4">{paragraph}</p> : null
          ))}
        </div>

        {instagramMedia && instagramMedia.length > 0 && (
          <div className="mt-4 space-y-4">
            {instagramMedia.map((media, index) => (
              <div key={index} className="instagram-embed aspect-[5/6]">
                <iframe
                  src={media.url}
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
          className="mt-2 w-full flex items-center justify-center gap-2 transition-colors"
          onClick={() => setIsExpanded(!isExpanded)}
          style={buttonColor ? { backgroundColor: buttonColor, color: 'white' } : undefined}
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
