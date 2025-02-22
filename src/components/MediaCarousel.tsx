
import { useState, useEffect, useRef } from "react";
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
  const videoRef = useRef<HTMLVideoElement>(null);
  
  // Combine all media into one array
  const allMedia = [
    ...images.map(url => ({ type: "image" as const, url })),
    ...videoUrls.map(url => ({ type: "video" as const, url })),
    ...instagramMedia
  ];

  useEffect(() => {
    // Pause all videos except the current one
    const videos = document.querySelectorAll('video');
    videos.forEach(video => {
      if (video !== videoRef.current) {
        video.pause();
      }
    });
  }, [currentIndex]);

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
      <div className="relative w-full h-0 pb-[100%]">
        {currentMedia.type === 'video' ? (
          currentMedia.url.includes('youtube.com') || currentMedia.url.includes('youtu.be') ? (
            <iframe
              src={`${getVideoUrl(currentMedia.url)}?autoplay=0`}
              className="absolute inset-0 w-full h-full"
              allowFullScreen
              allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              title={title}
            />
          ) : (
            <video
              ref={videoRef}
              src={currentMedia.url}
              controls
              loop
              playsInline
              className="absolute inset-0 w-full h-full object-contain"
              controlsList="nodownload"
              onPlay={() => {
                // Pause all other videos when this one starts playing
                const videos = document.querySelectorAll('video');
                videos.forEach(video => {
                  if (video !== videoRef.current) {
                    video.pause();
                  }
                });
              }}
            >
              Seu navegador não suporta a reprodução de vídeos.
            </video>
          )
        ) : (
          <img
            src={currentMedia.url}
            alt={title}
            className="absolute inset-0 w-full h-full object-contain"
          />
        )}
      </div>

      {/* Mostrar pontos de navegação apenas se houver mais de um item */}
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
