
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { MediaCarousel } from "@/components/MediaCarousel";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { X } from "lucide-react";

interface Story {
  id: string;
  user_id: string;
  media_url: string;
  media_type: 'image' | 'video';
  created_at: string;
  expires_at: string;
  user: {
    username: string;
    full_name: string;
    avatar_url: string;
  };
}

const StoryView = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: story } = useQuery({
    queryKey: ['story', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('stories')
        .select(`
          *,
          user:user_id (
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
    if (story && new Date(story.expires_at) < new Date()) {
      navigate('/');
    }
  }, [story, navigate]);

  if (!story) return null;

  return (
    <div className="fixed inset-0 bg-black">
      <div className="relative h-full">
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 z-10 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Avatar className="w-10 h-10 border-2 border-white/20">
                <AvatarImage src={story.user.avatar_url} />
                <AvatarFallback>
                  {story.user.full_name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-white font-semibold">
                  {story.user.username}
                </p>
                <p className="text-white/60 text-sm">
                  {new Date(story.created_at).toLocaleTimeString()}
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate('/')}
              className="p-2 rounded-full hover:bg-white/10"
            >
              <X className="w-6 h-6 text-white" />
            </button>
          </div>
        </div>

        {/* Media Content */}
        <div className="h-full flex items-center justify-center">
          <MediaCarousel
            images={story.media_type === 'image' ? [story.media_url] : []}
            videoUrls={story.media_type === 'video' ? [story.media_url] : []}
            title=""
            autoplay={true}
            showControls={false}
            cropMode="cover"
          />
        </div>
      </div>
    </div>
  );
};

export default StoryView;
