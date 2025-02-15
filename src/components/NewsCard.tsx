
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface NewsCardProps {
  title: string;
  content: string;
  image?: string;
  video?: string;
  createdAt?: string;
  buttonColor?: string;
  buttonSecondaryColor?: string;
  category?: {
    id: string;
    name: string;
    background_color?: string;
  } | null;
}

const NewsCard = ({
  title,
  content,
  image,
  video,
  createdAt,
  buttonColor,
  buttonSecondaryColor,
  category
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

  return (
    <Card className="overflow-hidden transition-transform hover:scale-[1.02]">
      {image && (
        <div className="relative h-48">
          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      {video && (
        <div className="relative h-48">
          <iframe
            src={getEmbedUrl(video)}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full"
          />
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
