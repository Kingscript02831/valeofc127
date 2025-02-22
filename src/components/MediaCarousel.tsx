
import React from 'react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

interface MediaCarouselProps {
  images?: string[];
  videoUrls?: string[];
  title?: string;
  autoplay?: boolean;
  showControls?: boolean;
  cropMode?: "contain" | "cover";
}

export const MediaCarousel: React.FC<MediaCarouselProps> = ({
  images = [],
  videoUrls = [],
  title = "",
  autoplay = false,
  showControls = true,
  cropMode = "cover",
}) => {
  const hasMedia = images.length > 0 || videoUrls.length > 0;

  if (!hasMedia) return null;

  return (
    <Carousel className="w-full">
      <CarouselContent>
        {images.map((image, index) => (
          <CarouselItem key={`image-${index}`}>
            <img
              src={image}
              alt={`${title} - Image ${index + 1}`}
              className={`w-full h-[300px] object-${cropMode}`}
            />
          </CarouselItem>
        ))}
        {videoUrls.map((url, index) => (
          <CarouselItem key={`video-${index}`}>
            <video
              src={url}
              controls={showControls}
              autoPlay={autoplay}
              loop
              muted
              className={`w-full h-[300px] object-${cropMode}`}
            />
          </CarouselItem>
        ))}
      </CarouselContent>
      {(images.length > 1 || videoUrls.length > 1) && (
        <>
          <CarouselPrevious />
          <CarouselNext />
        </>
      )}
    </Carousel>
  );
};
