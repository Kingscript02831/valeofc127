
import { useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface MediaCarouselProps {
  images: string[];
  videoUrls: string[];
  instagramUrls?: string[];
  title: string;
}

type MediaItem = {
  type: "image" | "video" | "instagram";
  url: string;
};

export const MediaCarousel = ({ images, videoUrls, instagramUrls = [], title }: MediaCarouselProps) => {
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
    }) || []),
    ...(instagramUrls?.map(url => {
      let embedUrl = url;
      // Remove parâmetros e trailing slashes
      embedUrl = embedUrl.split('?')[0].replace(/\/+$/, '');
      
      // Garantir que a URL começa com https://
      if (!embedUrl.startsWith('http')) {
        embedUrl = 'https://' + embedUrl;
      }
      
      // Remover www. se existir
      embedUrl = embedUrl.replace('www.', '');
      
      // Transformar URLs de reel em post
      embedUrl = embedUrl.replace('/reel/', '/p/');
      
      // Garantir que termina com /embed
      if (!embedUrl.endsWith('/embed')) {
        embedUrl = embedUrl + '/embed';
      }

      // Adicionar parâmetros necessários
      embedUrl = `${embedUrl}?cr=1&v=14&wp=540&rd=https%3A%2F%2Finstagram.com`;

      return { type: "instagram" as const, url: embedUrl };
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
    if (currentMedia.type !== 'instagram') {
      setIsFullscreen(!isFullscreen);
    }
  };

  const getYoutubeVideoId = (url: string) => {
    if (url.includes('youtu.be')) {
      return url.split('youtu.be/')[1];
    }
    const urlParams = new URLSearchParams(new URL(url).search);
    return urlParams.get('v');
  };

  const renderMedia = (mediaItem: MediaItem, isFullscreen: boolean = false) => {
    if (mediaItem.type === 'instagram') {
      return (
        <div className="w-full aspect-square">
          <iframe
            src={mediaItem.url}
            className="w-full h-full"
            frameBorder="0"
            scrolling="no"
            allowTransparency
            allow="encrypted-media; picture-in-picture; web-share"
            loading="lazy"
            referrerPolicy="origin"
            title={`Instagram post ${currentIndex + 1}`}
          />
        </div>
      );
    }
    
    if (mediaItem.type === 'video') {
      const isYoutubeUrl = mediaItem.url.includes('youtube.com') || mediaItem.url.includes('youtu.be');
      
      if (isYoutubeUrl) {
        const videoId = getYoutubeVideoId(mediaItem.url);
        return (
          <div className={cn(
            "relative w-full aspect-video",
            isFullscreen && "h-[80vh]"
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
            "relative w-full aspect-video",
            isFullscreen && "h-[80vh]"
          )}>
            <video
              src={mediaItem.url}
              controls
              className="absolute inset-0 w-full h-full object-contain"
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
          "w-full object-contain cursor-pointer",
          isFullscreen ? "max-h-[90vh]" : "max-h-[600px]"
        )}
        onClick={toggleFullscreen}
      />
    );
  };

  if (!allMedia.length) return null;

  return (
    <>
      <div className="relative bg-gray-100">
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

      {isFullscreen && currentMedia && currentMedia.type !== 'instagram' && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center">
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
