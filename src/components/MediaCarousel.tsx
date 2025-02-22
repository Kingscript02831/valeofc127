
import { useState, useEffect } from "react";
import type { InstagramMedia } from "@/types/supabase";

interface MediaCarouselProps {
  images: string[];
  videoUrls: string[];
  title: string;
  autoplay?: boolean;
  instagramMedia?: InstagramMedia[];
}

const MediaCarousel = ({ 
  images = [], 
  videoUrls = [], 
  title,
  autoplay = false,
  instagramMedia = []
}: MediaCarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Process Instagram URLs to get proper embed URLs
  const processedInstagramMedia = instagramMedia.map(media => {
    let processedUrl = media.url;
    
    // Convert Instagram post URL to embed URL
    if (media.type === 'post' && media.url.includes('instagram.com/p/')) {
      const postId = media.url.split('/p/')[1]?.split('/')[0];
      if (postId) {
        processedUrl = `https://www.instagram.com/p/${postId}/embed`;
      }
    }
    
    // Convert Instagram video URL to embed URL
    if (media.type === 'video' && media.url.includes('instagram.com/reel/')) {
      const reelId = media.url.split('/reel/')[1]?.split('/')[0];
      if (reelId) {
        processedUrl = `https://www.instagram.com/reel/${reelId}/embed`;
      }
    }
    
    return { ...media, url: processedUrl };
  });
  
  // Combine all media into one array
  const allMedia = [
    ...images.map(url => ({ type: "image" as const, url })),
    ...videoUrls.map(url => ({ type: "video" as const, url })),
    ...processedInstagramMedia
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

  const getVideoUrl = (url: string) => {
    // Convert YouTube watch URLs to embed URLs
    if (url.includes('youtube.com/watch?v=')) {
      const videoId = url.split('v=')[1]?.split('&')[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    // Convert YouTube short URLs
    if (url.includes('youtu.be/')) {
      const videoId = url.split('youtu.be/')[1]?.split('?')[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    return url;
  };

  const renderMedia = () => {
    if (currentMedia.type === 'post' || (currentMedia.type === 'video' && currentMedia.url.includes('instagram.com'))) {
      return (
        <iframe
          src={currentMedia.url}
          className="absolute inset-0 w-full h-full border-none"
          allowFullScreen
          loading="lazy"
          title={`Instagram ${currentMedia.type}`}
        />
      );
    }

    if (currentMedia.type === 'video') {
      if (currentMedia.url.includes('youtube.com') || currentMedia.url.includes('youtu.be')) {
        return (
          <iframe
            src={getVideoUrl(currentMedia.url)}
            className="absolute inset-0 w-full h-full"
            allowFullScreen
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            title={title}
          />
        );
      }

      return (
        <video
          src={currentMedia.url}
          controls
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-contain"
          controlsList="nodownload"
        >
          Seu navegador não suporta a reprodução de vídeos.
        </video>
      );
    }

    return (
      <img
        src={currentMedia.url}
        alt={title}
        className="absolute inset-0 w-full h-full object-contain"
      />
    );
  };

  return (
    <div className="relative w-full h-full bg-background overflow-hidden">
      <div className="relative w-full h-0 pb-[100%]">
        {renderMedia()}
      </div>

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
