
import { useState, useEffect } from "react";

interface MediaCarouselProps {
  images: string[];
  videoUrls: string[];
  title: string;
  autoplay?: boolean;
}

export const MediaCarousel = ({ images, videoUrls, title, autoplay = false }: MediaCarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const allMedia = [...images.map(url => ({ type: "image" as const, url })), ...videoUrls.map(url => ({ type: "video" as const, url }))];

  useEffect(() => {
    if (!autoplay || allMedia.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((current) => (current + 1) % allMedia.length);
    }, 5000); // Change media every 5 seconds

    return () => clearInterval(interval);
  }, [autoplay, allMedia.length]);

  if (!allMedia.length) return null;

  const currentMedia = allMedia[currentIndex];

  return (
    <div className="relative w-full h-full bg-gray-100 overflow-hidden">
      {currentMedia.type === 'video' ? (
        <div className="relative w-full aspect-video">
          <video
            src={currentMedia.url}
            autoPlay={autoplay}
            loop
            muted={autoplay}
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
            controlsList="nodownload nofullscreen noremoteplayback" // Remove three dots menu
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
