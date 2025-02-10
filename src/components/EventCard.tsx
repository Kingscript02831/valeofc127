import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar, ChevronDown, ChevronUp, Clock, MapPin, ChevronLeft, ChevronRight, X, Timer, ExternalLink, Ticket } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from '@/integrations/supabase/types';

type SiteConfig = Database['public']['Tables']['site_configuration']['Row'];

interface EventCardProps {
  title: string;
  description: string;
  eventDate: string;
  eventTime: string;
  image?: string;
  images?: string[];
  location?: string;
  mapsUrl?: string;
  entranceFee?: string;
  createdAt?: string;
  buttonColor?: string;
  buttonSecondaryColor?: string;
  category?: {
    id: string;
    name: string;
    background_color?: string;
  } | null;
}

const EventCard = ({
  title,
  description,
  eventDate,
  eventTime,
  image,
  images = [],
  location,
  mapsUrl,
  entranceFee,
  createdAt,
  buttonColor,
  buttonSecondaryColor,
  category,
}: EventCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isImageFullscreen, setIsImageFullscreen] = useState(false);
  const [countdown, setCountdown] = useState({ days: 0, hrs: 0, mins: 0, secs: 0, isExpired: false });
  const [config, setConfig] = useState<SiteConfig | null>(null);

  const date = parseISO(eventDate);
  const formattedDate = format(date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR });

  const formattedCreatedAt = createdAt 
    ? format(new Date(createdAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })
    : null;
  
  const allImages = image ? [image, ...images] : images;
  const hasMultipleImages = allImages.length > 1;

  useEffect(() => {
    const fetchConfig = async () => {
      const { data } = await supabase
        .from("site_configuration")
        .select("*")
        .maybeSingle();
      
      if (data) {
        setConfig(data);
      }
    };

    fetchConfig();
  }, []);

  useEffect(() => {
    const calculateTimeLeft = () => {
      try {
        if (!eventDate || !eventTime || !date) {
          setCountdown({ days: 0, hrs: 0, mins: 0, secs: 0, isExpired: true });
          return;
        }

        const [hours, minutes] = eventTime.split(':').map(Number);
        const targetDate = new Date(date);
        targetDate.setHours(hours, minutes, 0, 0);
        
        const now = new Date();
        const difference = targetDate.getTime() - now.getTime();

        if (difference <= 0) {
          setCountdown({ days: 0, hrs: 0, mins: 0, secs: 0, isExpired: true });
          return;
        }

        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const totalHours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const totalMinutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        setCountdown({
          days,
          hrs: totalHours,
          mins: totalMinutes,
          secs: seconds,
          isExpired: false
        });
      } catch (error) {
        console.error('Error calculating countdown:', error);
        setCountdown({ days: 0, hrs: 0, mins: 0, secs: 0, isExpired: true });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [eventDate, eventTime, date]);

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

  const primaryColor = buttonColor || config?.primary_color || '#000000';
  
  const buttonStyle = buttonColor ? {
    background: buttonSecondaryColor 
      ? `linear-gradient(to right, ${buttonColor}, ${buttonSecondaryColor})`
      : buttonColor,
    color: '#FFFFFF',
    border: 'none'
  } : undefined;

  return (
    <>
      <Card className="overflow-hidden transition-transform hover:scale-[1.02] max-w-sm mx-auto">
        {allImages.length > 0 && (
          <div className="relative h-48 w-full overflow-hidden">
            <img
              src={allImages[currentImageIndex]}
              alt={`${title} - Imagem ${currentImageIndex + 1}`}
              className="h-full w-full object-cover cursor-pointer"
              onClick={toggleImageFullscreen}
            />
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 text-white hover:bg-black/50"
              onClick={toggleImageFullscreen}
            >
              <X className="h-6 w-6" />
            </Button>
          </div>
        )}
        <div className="p-4">
          <h3 className="mb-2 text-xl font-bold">{title}</h3>
          
          <div className="mb-3 flex flex-wrap gap-2 text-xs text-gray-600">
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>{formattedDate}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>{eventTime}</span>
            </div>
            {location && (
              <div className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                <span>{location}</span>
              </div>
            )}
            {category && (
              <span 
                className="px-2 py-0.5 rounded-full text-xs"
                style={{
                  backgroundColor: category.background_color ? `${category.background_color}40` : '#D6BCFA40',
                  color: category.background_color || '#1A1F2C'
                }}
              >
                {category.name}
              </span>
            )}
          </div>

          <div className="mb-3 space-y-2">
            {mapsUrl && (
              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800"
              >
                <ExternalLink className="h-4 w-4" />
                <span>Ver no Google Maps</span>
              </a>
            )}
            {entranceFee && (
              <div className="flex items-center gap-2 text-sm">
                <Ticket className="h-4 w-4 text-gray-500" />
                <span>{entranceFee}</span>
              </div>
            )}
          </div>

          <div className="mb-3">
            {countdown.isExpired ? (
              <div className="text-red-500 text-xs font-medium">Evento já aconteceu</div>
            ) : (
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-1 mb-1">
                  <Timer className="h-3 w-3" style={{ color: primaryColor }} />
                  <span className="text-[10px] font-medium" style={{ color: primaryColor }}>
                    Tempo até o evento:
                  </span>
                </div>
                <div className="flex gap-1 justify-start">
                  <span 
                    className="text-white text-xs px-1.5 py-0.5 rounded"
                    style={{ backgroundColor: primaryColor }}
                  >
                    {countdown.days}d
                  </span>
                  <span 
                    className="text-white text-xs px-1.5 py-0.5 rounded"
                    style={{ backgroundColor: primaryColor }}
                  >
                    {String(countdown.hrs).padStart(2, '0')}h
                  </span>
                  <span 
                    className="text-white text-xs px-1.5 py-0.5 rounded"
                    style={{ backgroundColor: primaryColor }}
                  >
                    {String(countdown.mins).padStart(2, '0')}m
                  </span>
                  <span 
                    className="text-white text-xs px-1.5 py-0.5 rounded"
                    style={{ backgroundColor: primaryColor }}
                  >
                    {String(countdown.secs).padStart(2, '0')}s
                  </span>
                </div>
              </div>
            )}
          </div>

          {formattedCreatedAt && (
            <div className="mb-2 text-xs text-gray-500">
              Publicado em {formattedCreatedAt}
            </div>
          )}
          
          <div className={cn("prose prose-sm max-w-none text-sm", !isExpanded && "line-clamp-3")}>
            {description.split('\n').map((paragraph, index) => (
              paragraph.trim() ? <p key={index} className="mb-2">{paragraph}</p> : null
            ))}
          </div>

          <Button
            variant="ghost"
            className={cn(
              "mt-2 w-full flex items-center justify-center gap-1 text-sm hover:bg-gray-100",
              buttonColor && "text-white hover:text-white hover:opacity-90"
            )}
            onClick={() => setIsExpanded(!isExpanded)}
            style={buttonStyle}
          >
            {isExpanded ? (
              <>
                Ver menos
                <ChevronUp className="h-3 w-3" />
              </>
            ) : (
              <>
                Ver mais
                <ChevronDown className="h-3 w-3" />
              </>
            )}
          </Button>
        </div>
      </Card>

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
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 px-3 py-1 rounded-full text-white text-sm">
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
