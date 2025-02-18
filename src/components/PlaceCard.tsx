
import { Phone, Globe, MapPin, Clock, User2, Facebook, Instagram, MessageCircle, ChevronDown, ChevronUp, Wallet } from "lucide-react";
import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import MediaCarousel from "./MediaCarousel";
import type { Place } from "@/types/places";

interface PlaceCardProps {
  place: Place & {
    categories?: {
      name: string;
      background_color?: string;
    } | null;
  };
}

export function PlaceCard({ place }: PlaceCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const socialMedia = place.social_media as { facebook?: string; instagram?: string } | null;

  const processedVideoUrls = (place.video_urls || []).map(url => {
    if (url.includes('dropbox.com')) {
      return url.replace('www.dropbox.com', 'dl.dropboxusercontent.com');
    }
    return url;
  });

  return (
    <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg group">
      {(place.images?.length > 0 || processedVideoUrls.length > 0) && (
        <div className="relative aspect-video overflow-hidden">
          <MediaCarousel 
            images={place.images || []}
            videoUrls={processedVideoUrls}
            title={place.name}
          />
        </div>
      )}
      
      <CardHeader className="space-y-2">
        <div className="flex justify-between items-start">
          <h2 className="text-xl font-semibold text-card-foreground">{place.name}</h2>
          {place.description && place.description.length > 150 && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
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
            </button>
          )}
        </div>

        {place.categories && (
          <span 
            className="inline-block px-2 py-0.5 rounded-full text-sm"
            style={{
              backgroundColor: place.categories.background_color ? `${place.categories.background_color}40` : '#D6BCFA40',
              color: place.categories.background_color || '#1A1F2C'
            }}
          >
            {place.categories.name}
          </span>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {place.description && (
          <p className={`text-muted-foreground text-sm ${!isExpanded && "line-clamp-3"}`}>
            {place.description}
          </p>
        )}

        <div className={`space-y-2 ${!isExpanded && place.description?.length && place.description.length > 150 ? "hidden" : ""}`}>
          {place.address && (
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">{place.address}</span>
            </div>
          )}

          {place.owner_name && (
            <div className="flex items-center gap-2 text-sm">
              <User2 className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">{place.owner_name}</span>
            </div>
          )}

          {place.opening_hours && (
            <div className="flex items-center gap-2 text-sm">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">{place.opening_hours}</span>
            </div>
          )}

          {place.entrance_fee && (
            <div className="flex items-center gap-2 text-sm">
              <Wallet className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">
                Entrada: {place.entrance_fee}
              </span>
            </div>
          )}
        </div>

        <div className="pt-4 border-t border-border flex flex-wrap gap-3">
          {place.phone && (
            <a
              href={`tel:${place.phone}`}
              className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
            >
              <Phone className="w-4 h-4" />
            </a>
          )}

          {place.whatsapp && (
            <a
              href={`https://wa.me/${place.whatsapp.replace(/\D/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-sm text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300"
            >
              <MessageCircle className="w-4 h-4" />
            </a>
          )}

          {place.website && (
            <a
              href={place.website}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-sm text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-300"
            >
              <Globe className="w-4 h-4" />
            </a>
          )}

          {socialMedia?.facebook && (
            <a
              href={socialMedia.facebook}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
            >
              <Facebook className="w-4 h-4" />
            </a>
          )}

          {socialMedia?.instagram && (
            <a
              href={socialMedia.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-sm text-pink-600 hover:text-pink-800 dark:text-pink-400 dark:hover:text-pink-300"
            >
              <Instagram className="w-4 h-4" />
            </a>
          )}

          {place.maps_url && (
            <a
              href={place.maps_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-sm text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
            >
              <MapPin className="w-4 h-4" />
            </a>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
