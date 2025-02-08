import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar, ChevronDown, ChevronUp, Clock, MapPin, ChevronLeft, ChevronRight, X, Timer } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from '../../integrations/supabase/types';

type SiteConfig = Database['public']['Tables']['site_configuration']['Row'];

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
  const [countdown, setCountdown] = useState({ days: 0, hrs: 0, mins: 0, secs: 0, isExpired: false });
  const [config, setConfig] = useState<SiteConfig | null>(null);
  
  const date = new Date(eventDate);
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
        .single();
      
      if (data) {
        setConfig(data);
      }
    };

    fetchConfig();
  }, []);

  if (!config) return null;

  return (
    <>
      <Card className="overflow-hidden transition-transform hover:scale-[1.02] max-w-sm mx-auto">
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
          </div>

          <div className={cn("prose prose-sm max-w-none text-sm", !isExpanded && "line-clamp-3")}>
            {description.split('\n').map((paragraph, index) => (
              paragraph.trim() ? <p key={index} className="mb-2">{paragraph}</p> : null
            ))}
          </div>

          {/* Botão "Ver mais/menos" com cor sincronizada com a navbar */}
          <Button
            variant="ghost"
            className="mt-2 w-full flex items-center justify-center gap-1 text-sm rounded-lg transition-all hover:opacity-90"
            onClick={() => setIsExpanded(!isExpanded)}
            style={{
              backgroundColor: config.primary_color, // Cor de fundo do botão
              borderColor: config.primary_color, // Cor da borda do botão
              color: "white", // Texto branco
            }}
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
    </>
  );
};

export default EventCard;
