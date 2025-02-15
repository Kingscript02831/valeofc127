
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar, ChevronDown, ChevronUp, Clock, MapPin, ChevronLeft, ChevronRight, X, Timer, ExternalLink, Ticket } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { supabase } from "../integrations/supabase/client";
import { toast } from "sonner";
import type { Database } from "../../types/supabase";

type SiteConfig = Database['public']['Tables']['site_configuration']['Row'];

interface EventCardProps {
  title: string;
  description: string;
  eventDate: string;
  eventTime: string;
  endTime: string;
  image?: string;
  images?: string[];
  location?: string;
  mapsUrl?: string;
  entranceFee?: string;
  createdAt?: string;
  buttonColor?: string;
  buttonSecondaryColor?: string;
  videoUrl?: string;
  video_urls?: string[];
  category?: {
    id: string;
    name: string;
    background_color?: string;
  } | null;
}

type MediaItem = {
  type: "image" | "video";
  url: string;
};

const EventCard = ({
  title,
  description,
  eventDate,
  eventTime,
  endTime,
  image,
  images = [],
  location,
  mapsUrl,
  entranceFee,
  createdAt,
  buttonColor,
  buttonSecondaryColor,
  videoUrl,
  video_urls = [],
  category,
}: EventCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [countdown, setCountdown] = useState({ days: 0, hrs: 0, mins: 0, secs: 0, isExpired: false });
  const [config, setConfig] = useState<SiteConfig | null>(null);
  const [eventStatus, setEventStatus] = useState<'not_started' | 'in_progress' | 'ended'>('not_started');

  const allMedia: MediaItem[] = [
    ...(image ? [{ type: "image" as const, url: image }] : []),
    ...(images?.map(url => ({ type: "image" as const, url })) || []),
    ...(videoUrl ? [{ type: "video" as const, url: videoUrl }] : []),
    ...(video_urls?.map(url => ({ type: "video" as const, url })) || [])
  ];

  const hasMultipleMedia = allMedia.length > 1;
  const currentMedia = allMedia[currentIndex];

  const date = parseISO(eventDate);
  const formattedDate = format(date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR });

  const formattedCreatedAt = createdAt 
    ? format(new Date(createdAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })
    : null;

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

        const [startHours, startMinutes] = eventTime.split(':').map(Number);
        const [endHours, endMinutes] = endTime.split(':').map(Number);
        
        const startDate = new Date(date);
        startDate.setHours(startHours, startMinutes, 0, 0);
        
        const endDate = new Date(date);
        endDate.setHours(endHours, endMinutes, 0, 0);
        
        const now = new Date();

        if (now < startDate) {
          setEventStatus('not_started');
        } else if (now >= startDate && now <= endDate) {
          setEventStatus('in_progress');
          if (eventStatus !== 'in_progress') {
            toast.info("O evento começou!");
          }
        } else {
          setEventStatus('ended');
          if (eventStatus !== 'ended') {
            toast.info("O evento terminou!");
          }
          setCountdown({ days: 0, hrs: 0, mins: 0, secs: 0, isExpired: true });
          return;
        }

        if (eventStatus === 'not_started') {
          const difference = startDate.getTime() - now.getTime();
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
        }
      } catch (error) {
        console.error('Error calculating countdown:', error);
        setCountdown({ days: 0, hrs: 0, mins: 0, secs: 0, isExpired: true });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [eventDate, eventTime, endTime, date, eventStatus]);

  const nextMedia = () => {
    setCurrentIndex((prev) => (prev + 1) % allMedia.length);
  };

  const previousMedia = () => {
    setCurrentIndex((prev) => 
      prev === 0 ? allMedia.length - 1 : prev - 1
    );
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const primaryColor = buttonColor || config?.primary_color || '#9b87f5';
  const secondaryColor = buttonSecondaryColor || config?.secondary_color || '#7E69AB';
  
  const buttonStyle = buttonColor ? {
    background: buttonSecondaryColor 
      ? `linear-gradient(to right, ${buttonColor}, ${buttonSecondaryColor})`
      : buttonColor,
    color: '#FFFFFF',
    border: 'none'
  } : undefined;

  const renderMedia = (mediaItem: MediaItem, isFullscreen: boolean = false) => {
    if (mediaItem.type === 'video') {
      const videoId = mediaItem.url.includes('youtu.be') 
        ? mediaItem.url.split('youtu.be/')[1]
        : mediaItem.url.split('v=')[1]?.split('&')[0];

      return (
        <div className={cn(
          "relative w-full h-48",
          isFullscreen && "h-[80vh]"
        )}>
          <iframe
            src={`https://www.youtube.com/embed/${videoId}`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 w-full h-full"
          />
        </div>
      );
    }

    return (
      <img
        src={mediaItem.url}
        alt={`${title} - Mídia ${currentIndex + 1}`}
        className={cn(
          "h-full w-full object-cover cursor-pointer",
          isFullscreen ? "max-h-[90vh] max-w-[90vw] object-contain" : "h-48"
        )}
        onClick={toggleFullscreen}
      />
    );
  };

  return (
    <>
      <Card className="overflow-hidden transition-transform hover:scale-[1.02] max-w-sm mx-auto">
        {allMedia.length > 0 && (
          <div className="relative overflow-hidden">
            {renderMedia(currentMedia)}
            {hasMultipleMedia && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-2 top-1/2 -translate-y-1/2 text-white hover:bg-black/50"
                  onClick={previousMedia}
                >
                  <ChevronLeft className="h-6 w-6" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-white hover:bg-black/50"
                  onClick={nextMedia}
                >
                  <ChevronRight className="h-6 w-6" />
                </Button>
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/50 px-3 py-1 rounded-full text-white text-sm">
                  {currentIndex + 1} / {allMedia.length}
                </div>
              </>
            )}
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
              <span>{eventTime} - {endTime}</span>
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
            {eventStatus === 'ended' ? (
              <div className="text-red-500 text-xs font-medium">Evento já terminou</div>
            ) : eventStatus === 'in_progress' ? (
              <div className="text-green-500 text-xs font-medium">Evento em andamento</div>
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

      {isFullscreen && currentMedia && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center">
          <div className="relative w-full h-full flex items-center justify-center">
            {renderMedia(currentMedia, true)}
            
            {hasMultipleMedia && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-4 text-white hover:bg-black/50"
                  onClick={previousMedia}
                >
                  <ChevronLeft className="h-6 w-6" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-4 text-white hover:bg-black/50"
                  onClick={nextMedia}
                >
                  <ChevronRight className="h-6 w-6" />
                </Button>
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 px-3 py-1 rounded-full text-white text-sm">
                  {currentIndex + 1} / {allMedia.length}
                </div>
              </>
            )}
            
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 text-white hover:bg-black/50"
              onClick={toggleFullscreen}
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
