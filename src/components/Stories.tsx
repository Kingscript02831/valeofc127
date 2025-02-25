
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Plus } from "lucide-react";
import { PhotoUrlDialog } from "./PhotoUrlDialog";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";

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

export const Stories = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [mediaType, setMediaType] = useState<'image' | 'video'>('image');

  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    },
  });

  const { data: stories, refetch: refetchStories } = useQuery({
    queryKey: ['stories'],
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
        .gte('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Story[];
    },
  });

  const handleAddStory = async (url: string) => {
    try {
      if (!currentUser) return;

      // Calculate expiration (24 hours from now)
      const expires_at = new Date();
      expires_at.setHours(expires_at.getHours() + 24);

      const { error } = await supabase
        .from('stories')
        .insert({
          user_id: currentUser.id,
          media_url: url,
          media_type: mediaType,
          expires_at: expires_at.toISOString(),
        });

      if (error) throw error;

      refetchStories();
    } catch (error) {
      console.error('Error adding story:', error);
    }
  };

  return (
    <div className="w-full overflow-x-auto scrollbar-hide">
      <div className="flex gap-4 p-4">
        {/* Add Story Button */}
        <div className="flex flex-col items-center space-y-1">
          <button
            onClick={() => setIsDialogOpen(true)}
            className="relative w-16 h-16 rounded-full border-2 border-primary/20 hover:border-primary/40 transition-colors duration-200"
          >
            <Avatar className="w-full h-full">
              <AvatarImage
                src={currentUser?.user_metadata?.avatar_url}
                alt="Your avatar"
              />
              <AvatarFallback>
                {currentUser?.user_metadata?.full_name?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="absolute bottom-0 right-0 p-1 bg-primary rounded-full transform translate-x-1/4 translate-y-1/4">
              <Plus className="w-3 h-3 text-white" />
            </div>
          </button>
          <span className="text-xs font-medium text-center">
            Seu story
          </span>
        </div>

        {/* Stories List */}
        {stories?.map((story) => (
          <Link
            key={story.id}
            to={`/stories/${story.id}`}
            className="flex flex-col items-center space-y-1"
          >
            <div className="w-16 h-16 rounded-full p-[2px] bg-gradient-to-tr from-yellow-400 to-fuchsia-600">
              <Avatar className="w-full h-full border-2 border-background">
                <AvatarImage
                  src={story.user.avatar_url}
                  alt={story.user.username}
                />
                <AvatarFallback>
                  {story.user.full_name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </div>
            <span className="text-xs font-medium text-center text-muted-foreground">
              {story.user.username}
            </span>
          </Link>
        ))}
      </div>

      <PhotoUrlDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onConfirm={handleAddStory}
        title="Adicionar Story"
      />
    </div>
  );
};
