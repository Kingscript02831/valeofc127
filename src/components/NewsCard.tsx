
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Card } from "@/components/ui/card";
import MediaCarousel from "./MediaCarousel";
import { Link } from "react-router-dom";

interface NewsCardProps {
  id: string;
  title: string;
  content: string;
  date?: string;
  createdAt?: string;
  buttonColor?: string;
  category?: {
    name: string;
    slug?: string;
    background_color?: string;
  } | null;
  images?: string[];
  video_urls?: string[];
}

const NewsCard = ({
  id,
  title,
  content,
  date,
  createdAt,
  category,
  images = [],
  video_urls = []
}: NewsCardProps) => {
  const formattedCreatedAt = createdAt 
    ? format(new Date(createdAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })
    : null;

  const hasMedia = images?.length > 0 || video_urls?.length > 0;

  return (
    <Card className="overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-lg group">
      <Link to={`/noticias/${id}`} className="block">
        {/* Media Section */}
        {hasMedia && (
          <div className="relative aspect-video overflow-hidden bg-gray-100">
            <MediaCarousel 
              images={images}
              videoUrls={video_urls}
              title={title}
              cropMode="contain"
              showControls={true}
              autoplay={false}
            />
          </div>
        )}

        <div className="p-4 space-y-3">
          {/* Category and Date */}
          <div className="flex items-center justify-between gap-2 text-xs">
            {category && (
              <span 
                className="inline-block px-2 py-0.5 rounded-full"
                style={{
                  backgroundColor: category.background_color ? `${category.background_color}40` : '#D6BCFA40',
                  color: category.background_color || '#1A1F2C'
                }}
              >
                {category.name}
              </span>
            )}
            {formattedCreatedAt && (
              <span className="text-gray-500">
                {formattedCreatedAt}
              </span>
            )}
          </div>

          {/* Title */}
          <h3 className="text-lg font-bold leading-tight group-hover:text-primary transition-colors">
            {title}
          </h3>

          {/* Content Preview */}
          <div className="text-sm text-gray-600 line-clamp-3">
            {content}
          </div>
        </div>
      </Link>
    </Card>
  );
};

export default NewsCard;
