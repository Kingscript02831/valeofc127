
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, MapPin } from 'lucide-react';
import MediaCarousel from '@/components/MediaCarousel';

interface PlaceCardProps {
  id: string;
  name: string;
  description: string;
  address: string;
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

const PlaceCard: React.FC<PlaceCardProps> = ({
  name,
  description,
  address,
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
            title={name}
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
            {name}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {description}
          </p>
          {address && (
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <MapPin className="w-4 h-4" />
              <span className="line-clamp-1">{address}</span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end">
          <button
            onClick={onClick}
            className="flex items-center gap-2 text-sm font-medium transition-colors duration-200 hover:text-primary"
            style={{ color: buttonColor }}
          >
            Ver mais
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PlaceCard;
