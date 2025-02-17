
import { useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface MediaCarouselProps {
  images: string[];
  videoUrls: string[];
  title: string;
}

type MediaItem = {
  type: "image" | "video";
  url: string;
};

export const MediaCarousel = ({ images, videoUrls, title }: MediaCarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Combine all media into one array
  const allMedia: MediaItem[] = [
    ...(images?.map(url => ({ type: "image" as const, url })) || []),
    ...(videoUrls?.map(url => {
      const isYoutubeUrl = url.includes('youtube.com') || url.includes('youtu.be');
      return { 
        type: "video" as const, 
        url: isYoutubeUrl ? url : url.replace('www.dropbox.com', 'dl.dropboxusercontent.com')
      };
    }) || [])
  ];

  const hasMultipleMedia = allMedia.length > 1;
  const currentMedia = allMedia[currentIndex];

  const nextMedia = () => {
    setCurrentIndex((prev) => (prev + 1) % allMedia.length);
  };

  const previousMedia = () => {
    setCurrentIndex((prev) => 
      prev === 0 ? allMedia.length - 1 : prev - 1
    );
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const getYoutubeVideoId = (url: string) => {
    if (url.includes('youtu.be')) {
      return url.split('youtu.be/')[1];
    }
    const urlParams = new URLSearchParams(new URL(url).search);
    return urlParams.get('v');
  };

  const renderMedia = (mediaItem: MediaItem, isFullscreen: boolean = false) => {
    if (mediaItem.type === 'video') {
      const isYoutubeUrl = mediaItem.url.includes('youtube.com') || mediaItem.url.includes('youtu.be');
      
      if (isYoutubeUrl) {
        const videoId = getYoutubeVideoId(mediaItem.url);
        return (
          <div className={cn(
            "relative w-full h-full",
            isFullscreen ? "h-[80vh]" : "h-[500px]"
          )}>
            <iframe
              src={`https://www.youtube.com/embed/${videoId}`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="absolute inset-0 w-full h-full"
            />
          </div>
        );
      } else {
        return (
          <div className={cn(
            "relative w-full h-full",
            isFullscreen ? "h-[80vh]" : "h-[500px]"
          )}>
            <video
              src={mediaItem.url}
              controls
              className="absolute inset-0 w-full h-full object-contain bg-black"
            >
              Seu navegador não suporta a reprodução de vídeos.
            </video>
          </div>
        );
      }
    }

    return (
      <img
        src={mediaItem.url}
        alt={title}
        className={cn(
          "w-full cursor-pointer bg-black",
          isFullscreen ? "h-[90vh] object-contain" : "h-[500px] object-contain"
        )}
        onClick={toggleFullscreen}
      />
    );
  };

  if (!allMedia.length) return null;

  return (
    <>
      <div className="relative bg-black w-full h-full">
        {renderMedia(currentMedia)}
        {hasMultipleMedia && (
          <>
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-2 top-1/2 -translate-y-1/2 text-white hover:bg-black/50"
              onClick={previousMedia}
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2 text-white hover:bg-black/50"
              onClick={nextMedia}
            >
              <ChevronRight className="h-6 w-6" />
            </Button>
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/50 px-3 py-1 rounded-full text-white text-sm">
              {currentIndex + 1} / {allMedia.length}
            </div>
          </>
        )}
      </div>

      {isFullscreen && currentMedia && (
        <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
          <div className="relative w-full h-full flex items-center justify-center">
            {renderMedia(currentMedia, true)}
            
            {hasMultipleMedia && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-4 text-white hover:bg-black/50"
                  onClick={previousMedia}
                >
                  <ChevronLeft className="h-6 w-6" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-4 text-white hover:bg-black/50"
                  onClick={nextMedia}
                >
                  <ChevronRight className="h-6 w-6" />
                </Button>
              </>
            )}
            
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 text-white hover:bg-black/50"
              onClick={toggleFullscreen}
            >
              <X className="h-6 w-6" />
            </Button>

            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 px-3 py-1 rounded-full text-white text-sm">
              {currentIndex + 1} / {allMedia.length}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MediaCarousel;
