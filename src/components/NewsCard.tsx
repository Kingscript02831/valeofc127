import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";

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
}

const getYouTubeEmbedUrl = (url: string) => {
  if (!url) return '';
  
  // Handle youtube.com/watch?v= format
  const watchMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
  if (watchMatch) {
    return `https://www.youtube.com/embed/${watchMatch[1]}`;
  }

  // If it's already an embed URL or other format, return as is
  return url;
};

const getInstagramEmbedUrl = (url: string, type: 'post' | 'video') => {
  if (!url) return '';

  // Remove trailing slash and query parameters
  url = url.replace(/\/?\?.*$/, '');
  
  // For reels/videos
  if (url.includes('/reel/')) {
    const postId = url.split('/reel/')[1];
    return `https://www.instagram.com/reel/${postId}/embed`;
  }
  
  // For regular posts
  if (url.includes('/p/')) {
    const postId = url.split('/p/')[1];
    return `https://www.instagram.com/p/${postId}/embed`;
  }
  
  // If URL is in a different format, try to extract the ID
  const lastSegment = url.split('/').filter(Boolean).pop();
  if (lastSegment) {
    return type === 'video' 
      ? `https://www.instagram.com/reel/${lastSegment}/embed`
      : `https://www.instagram.com/p/${lastSegment}/embed`;
  }
  
  return url;
};

const NewsCard = ({ title, content, date, image, video, instagramMedia = [] }: NewsCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const embedUrl = getYouTubeEmbedUrl(video || '');

  // Convert line breaks to paragraphs
  const formattedContent = content.split('\n').map((paragraph, index) => (
    paragraph.trim() ? <p key={index} className="mb-4">{paragraph}</p> : null
  ));

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {video && (
        <div className="aspect-video">
          <iframe
            src={embedUrl}
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
        <h2 className="text-xl font-semibold mb-2">{title}</h2>
        <p className="text-sm text-gray-500 mb-2">{date}</p>
        
        <div className={`prose prose-sm max-w-none ${!isExpanded && "line-clamp-3"}`}>
          {formattedContent}
        </div>

        {instagramMedia && instagramMedia.length > 0 && (
          <div className="mt-4 space-y-4">
            {instagramMedia.map((media, index) => (
              <div key={index} className="instagram-embed aspect-[5/6]">
                <iframe
                  src={getInstagramEmbedUrl(media.url, media.type)}
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
          className="mt-2 w-full flex items-center justify-center gap-2"
          onClick={() => setIsExpanded(!isExpanded)}
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
