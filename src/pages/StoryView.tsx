
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { X } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Story {
  id: string;
  user_id: string;
  media_url: string;
  media_type: 'image' | 'video';
  content: string;
  created_at: string;
  expires_at: string;
  user: {
    username: string;
    full_name: string;
    avatar_url: string;
  };
}

const StoryView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [progress, setProgress] = useState(0);

  const { data: story } = useQuery({
    queryKey: ['story', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('stories')
        .select(`
          *,
          user:profiles(
            username,
            full_name,
            avatar_url
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as Story;
    },
  });

  useEffect(() => {
    if (story) {
      const duration = 10000; // 10 seconds
      const interval = 100; // Update every 100ms
      let elapsed = 0;

      const timer = setInterval(() => {
        elapsed += interval;
        setProgress((elapsed / duration) * 100);

        if (elapsed >= duration) {
          clearInterval(timer);
          navigate(-1);
        }
      }, interval);

      return () => clearInterval(timer);
    }
  }, [story, navigate]);

  if (!story) return null;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, "'Hoje às' HH:mm", { locale: ptBR });
  };

  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center">
      {/* Progress Bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gray-800">
        <div
          className="h-full bg-white transition-all duration-100 ease-linear"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Header */}
      <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <Avatar className="w-10 h-10 border-2 border-white/20">
            <AvatarImage src={story.user.avatar_url} />
            <AvatarFallback>{story.user.full_name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="text-white">
            <p className="font-medium">{story.user.username}</p>
            <p className="text-sm opacity-70">{formatDate(story.created_at)}</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="text-white hover:bg-white/20"
          onClick={() => navigate(-1)}
        >
          <X className="h-6 w-6" />
        </Button>
      </div>

      {/* Content */}
      <div className="w-full h-full flex items-center justify-center">
        {story.media_type === 'video' ? (
          <video
            src={story.media_url}
            className="max-h-full max-w-full object-contain"
            autoPlay
            controls={false}
            loop
            muted
          />
        ) : (
          <img
            src={story.media_url}
            alt={story.content}
            className="max-h-full max-w-full object-contain"
          />
        )}
      </div>

      {/* Text Content */}
      {story.content && (
        <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
          <p className="text-white text-lg">{story.content}</p>
        </div>
      )}
    </div>
  );
};

export default StoryView;
