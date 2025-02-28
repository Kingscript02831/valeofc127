
import React from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { cn } from "@/lib/utils";

interface MediaCarouselProps {
  images?: string[];
  videoUrls?: string[];
  title?: string;
  autoplay?: boolean;
  showControls?: boolean;
  cropMode?: "cover" | "contain";
  className?: string;
}

export function MediaCarousel({
  images = [],
  videoUrls = [],
  title = "",
  autoplay = false,
  showControls = true,
  cropMode = "cover",
  className,
}: MediaCarouselProps) {
  const allMedia = [...images, ...videoUrls];

  if (allMedia.length === 0) return null;

  const isVideo = (url: string) =>
    url.includes("youtube.com") || url.includes("youtu.be") || url.includes(".mp4");

  return (
    <Carousel
      className={cn("w-full relative group", className)}
      opts={{
        align: "start",
        loop: true,
      }}
    >
      <CarouselContent>
        {allMedia.map((url, index) => (
          <CarouselItem key={index}>
            <AspectRatio ratio={1} className="bg-muted">
              {isVideo(url) ? (
                <iframe
                  src={url}
                  title={`${title} - Video ${index + 1}`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full object-cover"
                />
              ) : (
                <img
                  src={url}
                  alt={`${title} - Image ${index + 1}`}
                  className={cn(
                    "w-full h-full",
                    cropMode === "contain" ? "object-contain" : "object-cover"
                  )}
                  loading="lazy"
                />
              )}
            </AspectRatio>
          </CarouselItem>
        ))}
      </CarouselContent>

      {showControls && allMedia.length > 1 && (
        <>
          <CarouselPrevious className="opacity-0 group-hover:opacity-100 transition-opacity" />
          <CarouselNext className="opacity-0 group-hover:opacity-100 transition-opacity" />
        </>
      )}
    </Carousel>
  );
}
