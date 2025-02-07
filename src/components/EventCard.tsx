
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar, Clock, MapPin } from "lucide-react";
import { Card } from "@/components/ui/card";

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
        
        <p className="text-gray-600">{description}</p>
      </div>
    </Card>
  );
};

export default EventCard;
