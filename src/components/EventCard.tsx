
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar, ChevronDown, ChevronUp, Clock, MapPin } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface EventCardProps {
  title: string;
  description: string;
  eventDate: string;
  eventTime: string;
  image?: string;
  location?: string;
}

const EventCard = ({
  title,
  description,
  eventDate,
  eventTime,
  image,
  location,
}: EventCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const date = new Date(eventDate);
  const formattedDate = format(date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR });

  return (
    <Card className="overflow-hidden transition-transform hover:scale-[1.02]">
      {image && (
        <div className="relative h-48 w-full overflow-hidden">
          <img
            src={image}
            alt={title}
            className="h-full w-full object-cover"
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
  );
};

export default EventCard;
