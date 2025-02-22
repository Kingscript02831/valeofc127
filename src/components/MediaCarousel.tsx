
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
    }, 5000);

    return () => clearInterval(interval);
  }, [autoplay, allMedia.length]);

  if (!allMedia.length) return null;

  const currentMedia = allMedia[currentIndex];

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
    <div className="relative w-full h-full bg-background overflow-hidden">
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
              className="absolute inset-0 w-full h-full object-contain"
              controlsList="nodownload"
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
            className="absolute inset-0 w-full h-full object-contain"
          />
        </div>
      )}

      {/* Pontos de navegação apenas se houver mais de um item de mídia */}
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
