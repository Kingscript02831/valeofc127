
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar, ChevronDown, ChevronUp, Clock, MapPin, ChevronLeft, ChevronRight, X, Timer } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface EventCardProps {
  title: string;
  description: string;
  eventDate: string;
  eventTime: string;
  image?: string;
  images?: string[];
  location?: string;
  createdAt?: string;
}

const EventCard = ({
  title,
  description,
  eventDate,
  eventTime,
  image,
  images = [],
  location,
  createdAt,
}: EventCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isImageFullscreen, setIsImageFullscreen] = useState(false);
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: false });
  
  const date = new Date(eventDate);
  const formattedDate = format(date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
  const formattedCreatedAt = createdAt 
    ? format(new Date(createdAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })
    : null;
  
  // Combine single image with images array
  const allImages = image ? [image, ...images] : images;
  const hasMultipleImages = allImages.length > 1;

  useEffect(() => {
    const calculateTimeLeft = () => {
      const eventDateTime = new Date(`${eventDate}T${eventTime}`);
      const now = new Date();
      const difference = eventDateTime.getTime() - now.getTime();

      if (difference <= 0) {
        setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true });
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setCountdown({ days, hours, minutes, seconds, isExpired: false });
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000); // Update every second for smoother countdown

    return () => clearInterval(timer);
  }, [eventDate, eventTime]);

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
  };

  const previousImage = () => {
    setCurrentImageIndex((prev) => 
      prev === 0 ? allImages.length - 1 : prev - 1
    );
  };

  const toggleImageFullscreen = () => {
    setIsImageFullscreen(!isImageFullscreen);
  };

  return (
    <>
      <Card className="overflow-hidden transition-transform hover:scale-[1.02]">
        {allImages.length > 0 && (
          <div className="relative h-64 w-full overflow-hidden">
            <img
              src={allImages[currentImageIndex]}
              alt={`${title} - Imagem ${currentImageIndex + 1}`}
              className="h-full w-full object-contain bg-gray-100 cursor-pointer"
              onClick={toggleImageFullscreen}
            />
          </div>
        )}
        <div className="p-6">
          <h3 className="mb-2 text-2xl font-bold">{title}</h3>
          
          <div className="mb-4 flex flex-wrap gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>{formattedDate}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{eventTime}</span>
            </div>
            {location && (
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                <span>{location}</span>
              </div>
            )}
          </div>

          {/* Shopee-style countdown timer */}
          <div className="mb-4">
            {countdown.isExpired ? (
              <div className="text-red-500 font-medium">Evento já aconteceu</div>
            ) : (
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <Timer className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-600">Tempo até o evento:</span>
                </div>
                <div className="flex gap-2 justify-start">
                  <div className="flex flex-col items-center">
                    <div className="bg-blue-600 text-white px-3 py-2 rounded-md font-bold min-w-[3rem]">
                      {countdown.days}
                    </div>
                    <span className="text-xs mt-1 text-gray-600">Dias</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="bg-blue-600 text-white px-3 py-2 rounded-md font-bold min-w-[3rem]">
                      {String(countdown.hours).padStart(2, '0')}
                    </div>
                    <span className="text-xs mt-1 text-gray-600">Horas</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="bg-blue-600 text-white px-3 py-2 rounded-md font-bold min-w-[3rem]">
                      {String(countdown.minutes).padStart(2, '0')}
                    </div>
                    <span className="text-xs mt-1 text-gray-600">Min</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="bg-blue-600 text-white px-3 py-2 rounded-md font-bold min-w-[3rem]">
                      {String(countdown.seconds).padStart(2, '0')}
                    </div>
                    <span className="text-xs mt-1 text-gray-600">Seg</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {formattedCreatedAt && (
            <div className="mb-4 text-sm text-gray-500">
              Publicado em {formattedCreatedAt}
            </div>
          )}
          
          <div className={cn("prose prose-sm max-w-none", !isExpanded && "line-clamp-3")}>
            {description.split('\n').map((paragraph, index) => (
              paragraph.trim() ? <p key={index} className="mb-4">{paragraph}</p> : null
            ))}
          </div>

          <Button
            variant="ghost"
            className="mt-2 w-full flex items-center justify-center gap-2"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? (
              <>
                Ver menos
                <ChevronUp className="h-4 w-4" />
              </>
            ) : (
              <>
                Ver mais
                <ChevronDown className="h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </Card>

      {/* Fullscreen Image Modal */}
      {isImageFullscreen && allImages.length > 0 && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center">
          <div className="relative w-full h-full flex items-center justify-center">
            <img
              src={allImages[currentImageIndex]}
              alt={`${title} - Imagem ${currentImageIndex + 1}`}
              className="max-h-[90vh] max-w-[90vw] object-contain"
            />
            
            {hasMultipleImages && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-4 text-white hover:bg-black/50"
                  onClick={previousImage}
                >
                  <ChevronLeft className="h-6 w-6" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-4 text-white hover:bg-black/50"
                  onClick={nextImage}
                >
                  <ChevronRight className="h-6 w-6" />
                </Button>
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 px-3 py-1 rounded-full text-white">
                  {currentImageIndex + 1} / {allImages.length}
                </div>
              </>
            )}
            
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 text-white hover:bg-black/50"
              onClick={toggleImageFullscreen}
            >
              <X className="h-6 w-6" />
            </Button>
          </div>
        </div>
      )}
    </>
  );
};

export default EventCard;
