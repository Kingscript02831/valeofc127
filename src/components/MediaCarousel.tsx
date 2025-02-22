
import { useState, useEffect } from "react";
import type { InstagramMedia } from "@/types/supabase";

interface MediaCarouselProps {
  images: string[];
  videoUrls: string[];
  title: string;
  autoplay?: boolean;
  instagramMedia?: InstagramMedia[];
}

export const MediaCarousel = ({ 
  images, 
  videoUrls, 
  title, 
  autoplay = false,
  instagramMedia = []
}: MediaCarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // Combine all media into one array
  const allMedia = [
    ...images.map(url => ({ type: "image" as const, url })),
    ...videoUrls.map(url => ({ type: "video" as const, url })),
    ...instagramMedia.map(media => ({ type: media.type === 'video' ? 'video' as const : 'image' as const, url: media.url }))
  ];

  useEffect(() => {
    if (!autoplay || allMedia.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((current) => (current + 1) % allMedia.length);
    }, 5000); // Change media every 5 seconds

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
    // Convert Instagram video URLs if needed
    if (url.includes('instagram.com/')) {
      // Convert to embed URL if it's not already
      if (!url.includes('/embed/')) {
        const postId = url.split('/p/')[1]?.split('/')[0];
        return `https://www.instagram.com/p/${postId}/embed`;
      }
    }
    return url;
  };

  return (
    <div className="relative w-full h-full bg-gray-100 overflow-hidden">
      {currentMedia.type === 'video' ? (
        <div className="relative w-full aspect-video">
          {currentMedia.url.includes('youtube.com') || currentMedia.url.includes('youtu.be') ? (
            <iframe
              src={getVideoUrl(currentMedia.url)}
              className="absolute inset-0 w-full h-full"
              allowFullScreen
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              title={title}
            />
          ) : currentMedia.url.includes('instagram.com') ? (
            <iframe
              src={getVideoUrl(currentMedia.url)}
              className="absolute inset-0 w-full h-full"
              allowFullScreen
              title={title}
            />
          ) : (
            <video
              src={currentMedia.url}
              autoPlay={autoplay}
              controls={!autoplay}
              loop
              muted={autoplay}
              playsInline
              className="absolute inset-0 w-full h-full object-cover"
              controlsList="nodownload"
            >
              Seu navegador não suporta a reprodução de vídeos.
            </video>
          )}
        </div>
      ) : (
        <div className="relative w-full aspect-[4/3]">
          <img
            src={currentMedia.url}
            alt={title}
            className="absolute inset-0 w-full h-full object-cover"
          />
        </div>
      )}
    </div>
  );
};

export default MediaCarousel;
