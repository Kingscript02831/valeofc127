
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar, ChevronDown, ChevronUp, Clock, MapPin, ChevronLeft, ChevronRight, Phone, Globe, MessageCircle, User2, Facebook, Instagram } from "lucide-react";
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
  images?: string[];
  location?: string;
  mapsUrl?: string;
  ownerName?: string;
  phone?: string;
  whatsapp?: string;
  website?: string;
  socialMedia?: {
    facebook?: string;
    instagram?: string;
  };
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
  ownerName,
  phone,
  whatsapp,
  website,
  socialMedia,
}: EventCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  const date = new Date(eventDate);
  const formattedDate = format(date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
  
  // Combine single image with images array
  const allImages = image ? [image, ...images] : images;
  const hasMultipleImages = allImages.length > 1;

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
  };

  const previousImage = () => {
    setCurrentImageIndex((prev) => 
      prev === 0 ? allImages.length - 1 : prev - 1
    );
  };

  return (
    <Card className="overflow-hidden transition-transform hover:scale-[1.02]">
      {allImages.length > 0 && (
        <div className="relative h-48 w-full overflow-hidden">
          <img
            src={allImages[currentImageIndex]}
            alt={`${title} - Imagem ${currentImageIndex + 1}`}
            className="h-full w-full object-cover transition-opacity duration-300"
          />
          {hasMultipleImages && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white hover:bg-black/70"
                onClick={previousImage}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white hover:bg-black/70"
                onClick={nextImage}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-black/50 px-2 py-1 text-xs text-white">
                {currentImageIndex + 1} / {allImages.length}
              </div>
            </>
          )}
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
          {ownerName && (
            <div className="flex items-center gap-1">
              <User2 className="h-4 w-4" />
              <span>{ownerName}</span>
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

        <div className="mt-4 pt-4 border-t flex flex-wrap gap-3">
          {phone && (
            <a
              href={`tel:${phone}`}
              className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
              title="Ligar"
            >
              <Phone className="w-4 h-4" />
            </a>
          )}

          {whatsapp && (
            <a
              href={`https://wa.me/${whatsapp.replace(/\D/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-sm text-green-600 hover:text-green-800"
              title="WhatsApp"
            >
              <MessageCircle className="w-4 h-4" />
            </a>
          )}

          {website && (
            <a
              href={website}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-sm text-purple-600 hover:text-purple-800"
              title="Site"
            >
              <Globe className="w-4 h-4" />
            </a>
          )}

          {socialMedia && (
            <>
              {socialMedia.facebook && (
                <a
                  href={socialMedia.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
                  title="Facebook"
                >
                  <Facebook className="w-4 h-4" />
                </a>
              )}
              {socialMedia.instagram && (
                <a
                  href={socialMedia.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-sm text-pink-600 hover:text-pink-800"
                  title="Instagram"
                >
                  <Instagram className="w-4 h-4" />
                </a>
              )}
            </>
          )}

          {mapsUrl && (
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-sm text-red-600 hover:text-red-800"
              title="Ver no mapa"
            >
              <MapPin className="w-4 h-4" />
            </a>
          )}
        </div>
      </div>
    </Card>
  );
};

export default EventCard;
