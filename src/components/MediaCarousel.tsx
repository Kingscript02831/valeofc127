
import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Maximize } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MediaCarouselProps {
  images: string[];
  videoUrls?: string[];
  title?: string;
}

export const MediaCarousel: React.FC<MediaCarouselProps> = ({
  images = [],
  videoUrls = [],
  title,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const allMedia = [...images, ...videoUrls];

  // Function to determine if the media is an image or video
  const isImage = (url: string) => {
    return !videoUrls.includes(url);
  };

  // Function to get YouTube video ID
  const getYouTubeId = (url: string) => {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  // Function to transform dropbox links for direct play
  const getVideoUrl = (url: string) => {
    if (url.includes('dropbox.com')) {
      // Already transformed link
      if (url.includes('dl.dropboxusercontent.com')) {
        return url;
      }
      // Transform link for direct access
      return url.replace('www.dropbox.com', 'dl.dropboxusercontent.com');
    }
    return url;
  };

  const handlePrevious = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? allMedia.length - 1 : prevIndex - 1
    );
  };

  const handleNext = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === allMedia.length - 1 ? 0 : prevIndex + 1
    );
  };

  if (allMedia.length === 0) {
    return null;
  }

  return (
    <div className="relative">
      <div className="relative aspect-square md:aspect-video rounded-lg overflow-hidden bg-black/10 dark:bg-black/30">
        {allMedia.map((mediaUrl, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-300 ${
              index === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`}
          >
            {isImage(mediaUrl) ? (
              <img
                src={mediaUrl}
                alt={title || `Image ${index + 1}`}
                className="w-full h-full object-contain"
              />
            ) : (
              <>
                {getYouTubeId(mediaUrl) ? (
                  <iframe
                    src={`https://www.youtube.com/embed/${getYouTubeId(mediaUrl)}`}
                    title={title || `Video ${index + 1}`}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                ) : (
                  <video
                    src={getVideoUrl(mediaUrl)}
                    className="w-full h-full object-contain"
                    controls
                    controlsList="nodownload"
                  >
                    Your browser does not support the video tag.
                  </video>
                )}
              </>
            )}
          </div>
        ))}
        
        {allMedia.length > 1 && (
          <div className="absolute z-20 bottom-4 left-1/2 transform -translate-x-1/2 flex items-center justify-center gap-1">
            {allMedia.map((_, index) => (
              <button
                key={index}
                className={`h-2 w-2 rounded-full transition-colors ${
                  index === currentIndex ? 'bg-white' : 'bg-white/50'
                }`}
                onClick={() => setCurrentIndex(index)}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        )}
        
        {allMedia.length > 1 && (
          <>
            <Button
              variant="ghost"
              size="icon"
              className="absolute z-20 left-2 top-1/2 transform -translate-y-1/2 w-8 h-8 rounded-full bg-black/30 hover:bg-black/50 p-1.5 text-white"
              onClick={handlePrevious}
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              className="absolute z-20 right-2 top-1/2 transform -translate-y-1/2 w-8 h-8 rounded-full bg-black/30 hover:bg-black/50 p-1.5 text-white"
              onClick={handleNext}
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </>
        )}
      </div>
      
      {allMedia.length > 0 && (
        <div className="mt-2 text-sm text-muted-foreground text-center">
          {currentIndex + 1} / {allMedia.length}
        </div>
      )}
    </div>
  );
};
