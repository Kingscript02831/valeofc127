
import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

interface MediaCarouselProps {
  images: string[];
  videoUrls: string[];
  title: string;
  autoplay?: boolean;
  cropMode?: 'cover' | 'contain';
  showControls?: boolean;
}

export const MediaCarousel = ({ 
  images, 
  videoUrls, 
  title,
  autoplay = false,
  cropMode = 'cover',
  showControls = true 
}: MediaCarouselProps) => {
  // Combine all media into one array
  const allMedia = [
    ...images.map(url => ({ type: "image" as const, url })),
    ...videoUrls.map(url => ({ type: "video" as const, url }))
  ];

  if (!allMedia.length) return null;

  const getVideoUrl = (url: string) => {
    if (url.includes('youtube.com/watch?v=')) {
      const videoId = url.split('v=')[1]?.split('&')[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    if (url.includes('youtu.be/')) {
      const videoId = url.split('youtu.be/')[1]?.split('?')[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    return url;
  };

  return (
    <Carousel
      className="relative w-full bg-background overflow-hidden"
      opts={{
        align: "start",
        loop: true
      }}
    >
      <CarouselContent>
        {allMedia.map((media, index) => (
          <CarouselItem key={index}>
            {media.type === 'video' ? (
              <div className="relative w-full">
                {media.url.includes('youtube.com') || media.url.includes('youtu.be') ? (
                  <div className="aspect-video">
                    <iframe
                      src={getVideoUrl(media.url)}
                      className="absolute inset-0 w-full h-full"
                      allowFullScreen
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      title={title}
                    />
                  </div>
                ) : (
                  <video
                    src={media.url}
                    controls={showControls}
                    loop
                    playsInline
                    className="w-full max-h-[80vh] object-contain"
                    controlsList="nodownload"
                    autoPlay={autoplay}
                  >
                    Seu navegador não suporta a reprodução de vídeos.
                  </video>
                )}
              </div>
            ) : (
              <img
                src={media.url}
                alt={title}
                className={cn(
                  "w-full max-h-[80vh]",
                  cropMode === 'contain' ? "object-contain" : "object-cover"
                )}
                loading="lazy"
              />
            )}
          </CarouselItem>
        ))}
      </CarouselContent>

      {showControls && allMedia.length > 1 && (
        <>
          <CarouselPrevious className="absolute left-2 top-1/2 -translate-y-1/2" />
          <CarouselNext className="absolute right-2 top-1/2 -translate-y-1/2" />
          
          {/* Media counter */}
          <div className="absolute top-2 right-2 px-2 py-1 rounded-full bg-background/80 text-xs font-medium">
            {allMedia.length} mídias
          </div>
        </>
      )}
    </Carousel>
  );
};

export default MediaCarousel;
