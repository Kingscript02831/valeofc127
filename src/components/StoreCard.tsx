
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Phone, Globe, MapPin, Clock, User2, Facebook, Instagram } from "lucide-react";
import MediaCarousel from "./MediaCarousel";

interface StoreCardProps {
  id: string;
  name: string;
  description?: string | null;
  address?: string | null;
  phone?: string | null;
  whatsapp?: string | null;
  website?: string | null;
  maps_url?: string | null;
  images?: string[] | null;
  social_media?: any;
  category_id?: string | null;
  opening_hours?: string | null;
}

const StoreCard = ({
  name,
  description,
  address,
  phone,
  whatsapp,
  website,
  maps_url,
  images,
  social_media,
  opening_hours,
}: StoreCardProps) => {
  return (
    <Card className="overflow-hidden">
      {images && images.length > 0 && (
        <div className="relative aspect-video">
          <MediaCarousel images={images} />
        </div>
      )}
      <CardHeader>
        <h3 className="text-lg font-semibold">{name}</h3>
      </CardHeader>
      <CardContent className="space-y-4">
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
        <div className="space-y-2">
          {address && (
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4" />
              <span>{address}</span>
            </div>
          )}
          {phone && (
            <div className="flex items-center gap-2 text-sm">
              <Phone className="h-4 w-4" />
              <a href={`tel:${phone}`} className="hover:underline">
                {phone}
              </a>
            </div>
          )}
          {opening_hours && (
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4" />
              <span>{opening_hours}</span>
            </div>
          )}
          {website && (
            <div className="flex items-center gap-2 text-sm">
              <Globe className="h-4 w-4" />
              <a
                href={website}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline"
              >
                Website
              </a>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex gap-2">
        {maps_url && (
          <Button
            variant="outline"
            size="sm"
            asChild
            className="flex-1"
          >
            <a
              href={maps_url}
              target="_blank"
              rel="noopener noreferrer"
            >
              <MapPin className="h-4 w-4 mr-2" />
              Como chegar
            </a>
          </Button>
        )}
        {whatsapp && (
          <Button
            variant="outline"
            size="sm"
            asChild
            className="flex-1"
          >
            <a
              href={`https://wa.me/${whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <User2 className="h-4 w-4 mr-2" />
              WhatsApp
            </a>
          </Button>
        )}
      </CardFooter>
      {social_media && (
        <CardFooter className="flex gap-2">
          {social_media.facebook && (
            <Button
              variant="outline"
              size="icon"
              asChild
            >
              <a
                href={social_media.facebook}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Facebook className="h-4 w-4" />
              </a>
            </Button>
          )}
          {social_media.instagram && (
            <Button
              variant="outline"
              size="icon"
              asChild
            >
              <a
                href={social_media.instagram}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Instagram className="h-4 w-4" />
              </a>
            </Button>
          )}
        </CardFooter>
      )}
    </Card>
  );
};

export default StoreCard;
