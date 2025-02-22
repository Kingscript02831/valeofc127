
import { useState, useEffect } from "react";
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

const MediaCarousel = ({
  images = [],
  videoUrls = [],
  title = "",
  autoplay = false,
  showControls = true,
  cropMode = "contain",
}: MediaCarouselProps) => {
  const [showArrows, setShowArrows] = useState(false);
  const allMedia = [...images, ...videoUrls];
  const hasMedia = allMedia.length > 0;

  if (!hasMedia) return null;

  return (
    <div 
      className="relative group"
      onMouseEnter={() => setShowArrows(true)}
      onMouseLeave={() => setShowArrows(false)}
    >
      <Carousel className="w-full">
        <CarouselContent>
          {images.map((image, index) => (
            <CarouselItem key={`image-${index}`}>
              <img
                src={image}
                alt={`${title} - Image ${index + 1}`}
                className={`w-full h-[300px] object-${cropMode} bg-black/5`}
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
                className="w-full h-[300px] object-contain bg-black/5"
                controlsList="nodownload"
              />
            </CarouselItem>
          ))}
        </CarouselContent>

        {/* Botões de navegação */}
        {allMedia.length > 1 && (
          <>
            <div className={`transition-opacity duration-200 ${showArrows ? 'opacity-100' : 'opacity-0'}`}>
              <CarouselPrevious className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 border-none text-white" />
              <CarouselNext className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 border-none text-white" />
            </div>
            
            {/* Indicadores */}
            <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
              {allMedia.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === 0 ? 'bg-white' : 'bg-white/50'
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </Carousel>
    </div>
  );
};

export default MediaCarousel;
