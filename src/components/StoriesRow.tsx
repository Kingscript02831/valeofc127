
import React, { useState, useEffect } from 'react';
import { ScrollArea, ScrollBar } from "./ui/scroll-area";
import StoryCircle from "./StoryCircle";
import StoryViewer from "./StoryViewer";
import { supabase } from "@/integrations/supabase/client";
import PhotoUrlDialog from "./PhotoUrlDialog";
import { useToast } from "@/hooks/use-toast";
import { PlusCircle } from "lucide-react";

interface Story {
  id: string;
  user_id: string;
  image_url: string;
  created_at: string;
  profiles: {
    username: string;
    avatar_url: string;
  };
}

const StoriesRow = () => {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [currentStory, setCurrentStory] = useState<Story | null>(null);
  const [photoDialogOpen, setPhotoDialogOpen] = useState(false);
  const { toast } = useToast();
  
  // Check if user is logged in
  const [userId, setUserId] = useState<string | null>(null);

  // Get current user
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        console.log("User logged in:", user.id);
      } else {
        console.log("No user logged in");
        setUserId(null);
      }
    };
    
    getUser();
  }, []);

  // Function to fetch stories
  const fetchStories = async () => {
    try {
      setLoading(true);
      console.log("Fetching stories...");
      
      // Build a query to get all stories that haven't expired yet
      const { data, error } = await supabase
        .from('stories')
        .select(`
          id,
          user_id,
          media_url as image_url,
          created_at,
          expires_at,
          profiles:user_id (username, avatar_url)
        `)
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching stories:', error);
        return;
      }
      
      console.log("Stories fetched:", data);
      
      // Format the data to match the Story interface
      const formattedStories = data.map((story: any) => ({
        ...story,
        profiles: {
          username: story.profiles?.username || 'Unknown',
          avatar_url: story.profiles?.avatar_url || null
        }
      }));
      
      setStories(formattedStories);
    } catch (error) {
      console.error('Error in fetchStories:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch stories on component mount
  useEffect(() => {
    fetchStories();
    
    // Set up a timer to refresh stories every minute
    const interval = setInterval(() => {
      fetchStories();
    }, 60000); // 60 seconds
    
    return () => clearInterval(interval);
  }, []);

  // Handle story click
  const handleStoryClick = (story: Story) => {
    setCurrentStory(story);
    setViewerOpen(true);
  };

  // Add new story
  const handleAddStory = async (url: string) => {
    if (!userId) {
      toast({
        title: "Erro",
        description: "Você precisa estar logado para adicionar histórias.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      console.log("Adding story with URL:", url);
      
      // Calculate expiry time (24 hours from now)
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24);
      
      const { error } = await supabase
        .from('stories')
        .insert({
          user_id: userId,
          media_url: url,
          media_type: url.match(/\.(mp4|mov|avi)$/i) ? 'video' : 'image',
          expires_at: expiresAt.toISOString()
        });
      
      if (error) {
        console.error('Error adding story:', error);
        toast({
          title: "Erro",
          description: "Não foi possível adicionar a história.",
          variant: "destructive",
        });
        return;
      }
      
      toast({
        title: "Sucesso",
        description: "História adicionada com sucesso!",
      });
      
      // Refresh stories
      fetchStories();
    } catch (error) {
      console.error('Error in handleAddStory:', error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao adicionar a história.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="w-full py-4 relative">
      <ScrollArea className="w-full whitespace-nowrap">
        <div className="flex space-x-4 px-4">
          {/* Add Story Button - Only shown when user is logged in */}
          {userId && (
            <div 
              className="flex flex-col items-center space-y-1 cursor-pointer"
              onClick={() => setPhotoDialogOpen(true)}
            >
              <div className="relative rounded-full p-[3px]">
                <div className="h-16 w-16 rounded-full border-2 border-white dark:border-gray-800 flex items-center justify-center bg-gray-100 dark:bg-gray-800">
                  <PlusCircle className="h-8 w-8 text-primary" />
                </div>
              </div>
              <span className="text-xs text-center truncate w-20">Adicionar</span>
            </div>
          )}
          
          {/* Stories */}
          {loading ? (
            // Loading skeletons
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex flex-col items-center space-y-1">
                <div className="h-16 w-16 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse" />
                <div className="h-2 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              </div>
            ))
          ) : stories.length > 0 ? (
            stories.map(story => (
              <StoryCircle
                key={story.id}
                imageUrl={story.profiles.avatar_url || '/placeholder.svg'}
                username={story.profiles.username}
                isNew={true}
                isOwn={userId === story.user_id}
                onClick={() => handleStoryClick(story)}
              />
            ))
          ) : (
            <div className="flex items-center justify-center w-full py-2">
              <p className="text-sm text-gray-500 dark:text-gray-400">Nenhuma história disponível</p>
            </div>
          )}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
      
      {/* Story Viewer */}
      {currentStory && (
        <StoryViewer
          isOpen={viewerOpen}
          onClose={() => setViewerOpen(false)}
          username={currentStory.profiles.username}
          imageUrl={currentStory.image_url}
          storyId={currentStory.id}
        />
      )}
      
      {/* Photo URL Dialog */}
      <PhotoUrlDialog
        isOpen={photoDialogOpen}
        onClose={() => setPhotoDialogOpen(false)}
        onConfirm={handleAddStory}
        title="Adicionar História"
      />
    </div>
  );
};

export default StoriesRow;
