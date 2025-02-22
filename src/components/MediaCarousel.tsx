
import { useState, useRef, TouchEvent } from "react";

interface MediaCarouselProps {
  images: string[];
  videoUrls: string[];
  title: string;
}

export const MediaCarousel = ({ images, videoUrls, title }: MediaCarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  const allMedia = [
    ...images.map(url => ({ type: "image" as const, url })),
    ...videoUrls.map(url => ({ type: "video" as const, url }))
  ];

  const handleTouchStart = (e: TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;

    const diff = touchStartX.current - touchEndX.current;
    const threshold = 50;

    if (Math.abs(diff) > threshold) {
      if (diff > 0 && currentIndex < allMedia.length - 1) {
        setCurrentIndex(prev => prev + 1);
      } else if (diff < 0 && currentIndex > 0) {
        setCurrentIndex(prev => prev - 1);
      }
    }

    touchStartX.current = null;
    touchEndX.current = null;
  };

  if (!allMedia.length) return null;

  const currentMedia = allMedia[currentIndex];

  return (
    <div 
      className="relative w-full h-full bg-gray-100 overflow-hidden"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {currentMedia.type === 'video' ? (
        <div className="relative w-full aspect-video">
          <video
            src={currentMedia.url}
            controls
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
          >
            Seu navegador não suporta a reprodução de vídeos.
          </video>
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
