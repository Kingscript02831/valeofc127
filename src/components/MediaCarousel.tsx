
import React from 'react';
import { Card } from './ui/card';
import { AspectRatio } from './ui/aspect-ratio';

interface MediaCarouselProps {
  images?: string[];
  videoUrls?: string[];
  title?: string;
  autoplay?: boolean;
  showControls?: boolean;
  cropMode?: 'cover' | 'contain';
}

export const MediaCarousel: React.FC<MediaCarouselProps> = ({
  images = [],
  videoUrls = [],
  title = '',
  autoplay = false,
  showControls = true,
  cropMode = 'cover'
}) => {
  if (images.length === 0 && videoUrls.length === 0) return null;

  return (
    <Card className="overflow-hidden border-none bg-transparent">
      <AspectRatio ratio={16 / 9}>
        {images.map((url, index) => (
          <img
            key={index}
            src={url}
            alt={`${title} - Image ${index + 1}`}
            className={`w-full h-full object-${cropMode}`}
          />
        ))}
        {videoUrls.map((url, index) => (
          <video
            key={index}
            src={url}
            controls={showControls}
            autoPlay={autoplay}
            loop
            muted={autoplay}
            className={`w-full h-full object-${cropMode}`}
          />
        ))}
      </AspectRatio>
    </Card>
  );
};
