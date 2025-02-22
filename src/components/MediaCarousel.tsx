
import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface MediaCarouselProps {
  images: string[];
  videoUrls: string[];
  instagramMedia?: InstagramMedia[];
  title: string;
}

interface InstagramMedia {
  url: string;
  type: 'post' | 'video';
}

type MediaItem = {
  type: "image" | "video" | "instagram";
  url: string;
};

export const MediaCarousel = ({ images, videoUrls, instagramMedia = [], title }: MediaCarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const allMedia: MediaItem[] = [
    ...(images?.map(url => ({ type: "image" as const, url })) || []),
    ...(videoUrls?.map(url => {
      const isYoutubeUrl = url.includes('youtube.com') || url.includes('youtu.be');
      return { 
        type: "video" as const, 
        url: isYoutubeUrl ? url : url.replace('www.dropbox.com', 'dl.dropboxusercontent.com')
      };
    }) || []),
    ...(instagramMedia?.map(media => {
      let embedUrl = typeof media === 'string' ? media : media.url;
      embedUrl = embedUrl.split('?')[0].replace(/\/+$/, '');
      if (!embedUrl.startsWith('http')) embedUrl = 'https://' + embedUrl;
      embedUrl = embedUrl.replace('www.', '');
      embedUrl = embedUrl.replace('/reel/', '/p/');
      if (!embedUrl.endsWith('/embed')) embedUrl = embedUrl + '/embed';
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

  const getYoutubeVideoId = (url: string) => {
    if (url.includes('youtu.be')) {
      return url.split('youtu.be/')[1];
    }
    const urlParams = new URLSearchParams(new URL(url).search);
    return urlParams.get('v');
  };

  const renderMedia = (mediaItem: MediaItem) => {
    if (mediaItem.type === 'instagram') {
      return (
        <div className="relative w-full aspect-[4/5]">
          <iframe
            src={mediaItem.url}
            className="absolute inset-0 w-full h-full"
            frameBorder="0"
            scrolling="no"
            allowTransparency
            allow="encrypted-media; picture-in-picture; web-share"
          />
        </div>
      );
    }

    if (mediaItem.type === 'video') {
      const isYoutubeUrl = mediaItem.url.includes('youtube.com') || mediaItem.url.includes('youtu.be');
      
      if (isYoutubeUrl) {
        const videoId = getYoutubeVideoId(mediaItem.url);
        return (
          <div className="relative w-full aspect-video">
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
          <div className="relative w-full aspect-video">
            <video
              src={mediaItem.url}
              controls
              playsInline
              className="absolute inset-0 w-full h-full object-cover"
            >
              Seu navegador não suporta a reprodução de vídeos.
            </video>
          </div>
        );
      }
    }

    return (
      <div className="relative w-full aspect-[4/3]">
        <img
          src={mediaItem.url}
          alt={title}
          className="absolute inset-0 w-full h-full object-cover"
        />
      </div>
    );
  };

  if (!allMedia.length) return null;

  return (
    <div className="relative w-full h-full bg-gray-100">
      {renderMedia(currentMedia)}
      
      {hasMultipleMedia && (
        <>
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-2 top-1/2 -translate-y-1/2 text-white hover:bg-black/50 z-10"
            onClick={previousMedia}
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-1/2 -translate-y-1/2 text-white hover:bg-black/50 z-10"
            onClick={nextMedia}
          >
            <ChevronRight className="h-6 w-6" />
          </Button>
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/50 px-3 py-1 rounded-full text-white text-sm z-10">
            {currentIndex + 1} / {allMedia.length}
          </div>
        </>
      )}
    </div>
  );
};

export default MediaCarousel;
