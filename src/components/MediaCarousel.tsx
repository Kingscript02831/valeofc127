
import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";

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
  cropMode = 'contain',
  showControls = false,
}: MediaCarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // Combine all media into one array
  const allMedia = [
    ...images.map(url => ({ type: "image" as const, url })),
    ...videoUrls.map(url => ({ type: "video" as const, url }))
  ];

  useEffect(() => {
    if (!autoplay || allMedia.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((current) => (current + 1) % allMedia.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [autoplay, allMedia.length]);

  if (!allMedia.length) return null;

  const currentMedia = allMedia[currentIndex];

  const handleNext = () => {
    setCurrentIndex((current) => (current + 1) % allMedia.length);
  };

  const handlePrevious = () => {
    setCurrentIndex((current) => (current - 1 + allMedia.length) % allMedia.length);
  };

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
    <div className="relative w-full h-full bg-background overflow-hidden group">
      {currentMedia.type === 'video' ? (
        <div className="relative w-full h-0 pb-[100%]">
          {currentMedia.url.includes('youtube.com') || currentMedia.url.includes('youtu.be') ? (
            <iframe
              src={getVideoUrl(currentMedia.url)}
              className="absolute inset-0 w-full h-full"
              allowFullScreen
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              title={title}
            />
          ) : (
            <video
              src={currentMedia.url}
              controls
              loop
              playsInline
              className={`absolute inset-0 w-full h-full object-${cropMode}`}
              controlsList="nodownload"
              autoPlay={false}
            >
              Seu navegador não suporta a reprodução de vídeos.
            </video>
          )}
        </div>
      ) : (
        <div className="relative w-full h-0 pb-[100%]">
          <img
            src={currentMedia.url}
            alt={title}
            className={`absolute inset-0 w-full h-full object-${cropMode}`}
          />
        </div>
      )}

      {/* Navigation arrows and counter */}
      {showControls && allMedia.length > 1 && (
        <>
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity",
              "hover:bg-background/90 hover:scale-110"
            )}
            onClick={handlePrevious}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity",
              "hover:bg-background/90 hover:scale-110"
            )}
            onClick={handleNext}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>

          {/* Media counter */}
          <div className="absolute top-2 right-2 px-2 py-1 rounded-full bg-background/80 text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity">
            {currentIndex + 1} / {allMedia.length}
          </div>
        </>
      )}

      {/* Navigation dots */}
      {allMedia.length > 1 && (
        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
          {allMedia.map((_, index) => (
            <button
              key={index}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentIndex ? 'bg-white' : 'bg-white/50'
              }`}
              onClick={() => setCurrentIndex(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default MediaCarousel;
