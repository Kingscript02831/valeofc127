
import React from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import MediaCarousel from '@/components/MediaCarousel';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight } from 'lucide-react';

interface NewsCardProps {
  id: string;
  title: string;
  content: string;
  date: string;
  createdAt: string;
  images: string[];
  video_urls: string[];
  category?: {
    name: string;
    slug: string;
    background_color?: string;
  };
  buttonColor?: string;
  onClick?: () => void;
}

const NewsCard: React.FC<NewsCardProps> = ({
  title,
  content,
  date,
  images,
  video_urls,
  category,
  buttonColor,
  onClick,
}) => {
  return (
    <Card className="overflow-hidden border-none shadow-md hover:shadow-lg transition-shadow duration-200">
      {(images?.length > 0 || video_urls?.length > 0) && (
        <div className="relative aspect-video">
          <MediaCarousel
            images={images}
            videoUrls={video_urls}
            title={title}
            cropMode="cover"
          />
        </div>
      )}
      <CardContent className="p-4 space-y-4">
        <div className="space-y-2">
          {category && (
            <Badge
              style={{
                backgroundColor: category.background_color
                  ? `${category.background_color}40`
                  : '#D6BCFA40',
                color: category.background_color || '#1A1F2C',
              }}
              className="transition-all duration-300 hover:scale-105"
            >
              {category.name}
            </Badge>
          )}
          <h3 className="font-semibold text-lg leading-tight line-clamp-2">
            {title}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-2">{content}</p>
        </div>

        <div className="flex items-center justify-between">
          <time className="text-sm text-muted-foreground">
            {format(new Date(date), "dd 'de' MMMM", { locale: ptBR })}
          </time>
          <button
            onClick={onClick}
            className="flex items-center gap-2 text-sm font-medium transition-colors duration-200 hover:text-primary"
            style={{ color: buttonColor }}
          >
            Ler mais
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </CardContent>
    </Card>
  );
};

export default NewsCard;
