
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
  viewed?: boolean;
}

interface ViewedStory {
  id: string;
  viewed_at: string;
}

const StoriesRow = () => {
  const [stories, setStories] = useState<Story[]>([]);
  const [viewedStories, setViewedStories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [currentStory, setCurrentStory] = useState<Story | null>(null);
  const [photoDialogOpen, setPhotoDialogOpen] = useState(false);
  const { toast } = useToast();
  
  // Check if user is logged in
  const [userId, setUserId] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);

  // Get current user
  useEffect(() => {
    const getUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setUserId(user.id);
          console.log("User logged in:", user.id);
          
          // Fetch user profile
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('username, avatar_url')
            .eq('id', user.id)
            .single();
            
          if (profileData && !profileError) {
            setUserProfile(profileData);
            console.log("User profile:", profileData);
          } else {
            console.log("Error fetching profile:", profileError);
          }
        } else {
          console.log("No user logged in");
          setUserId(null);
          setUserProfile(null);
        }
      } catch (error) {
        console.error("Error checking user:", error);
        setUserId(null);
        setUserProfile(null);
      }
    };
    
    getUser();
  }, []);

  // Load viewed stories from localStorage
  useEffect(() => {
    try {
      const viewedStoriesStr = localStorage.getItem('viewedStories');
      if (viewedStoriesStr) {
        const parsedViewedStories = JSON.parse(viewedStoriesStr);
        // Filter out viewed stories older than 24 hours
        const now = new Date();
        const filteredViewedStories = Object.entries(parsedViewedStories)
          .filter(([_, viewedAt]: [string, any]) => {
            const viewedTime = new Date(viewedAt);
            const hoursDiff = (now.getTime() - viewedTime.getTime()) / (1000 * 60 * 60);
            return hoursDiff < 24;
          })
          .map(([id]) => id);

        setViewedStories(filteredViewedStories);
      }
    } catch (error) {
      console.error("Error loading viewed stories:", error);
    }
  }, []);

  // Mark a story as viewed
  const markAsViewed = (storyId: string) => {
    try {
      // Get current viewed stories
      const viewedStoriesStr = localStorage.getItem('viewedStories') || '{}';
      const viewedStoriesObj = JSON.parse(viewedStoriesStr);
      
      // Add current story with timestamp
      viewedStoriesObj[storyId] = new Date().toISOString();
      
      // Save back to localStorage
      localStorage.setItem('viewedStories', JSON.stringify(viewedStoriesObj));
      
      // Update state
      setViewedStories(prev => [...prev, storyId]);
      
      // Update the stories array to mark this one as viewed
      setStories(prev => 
        prev.map(story => 
          story.id === storyId ? { ...story, viewed: true } : story
        )
      );
    } catch (error) {
      console.error("Error marking story as viewed:", error);
    }
  };

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
        },
        viewed: viewedStories.includes(story.id)
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
  }, [viewedStories]);

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

  // Handle story viewed callback
  const handleStoryViewed = () => {
    if (currentStory) {
      markAsViewed(currentStory.id);
    }
  };

  return (
    <div className="w-full py-4 relative bg-black">
      <ScrollArea className="w-full whitespace-nowrap">
        <div className="flex space-x-6 px-4">
          {/* Add Story Button - Only shown when user is logged in */}
          {userId && (
            <div 
              className="flex flex-col items-center space-y-1 cursor-pointer"
              onClick={() => setPhotoDialogOpen(true)}
            >
              <div className="relative rounded-full p-[2px] bg-gray-700">
                <div className="p-[2px] rounded-full bg-black">
                  <Avatar className="h-16 w-16 border-2 border-black bg-gray-800">
                    {userProfile?.avatar_url ? (
                      <AvatarImage src={userProfile.avatar_url} alt={userProfile.username || 'Seu'} className="opacity-60" />
                    ) : (
                      <AvatarFallback className="bg-gray-800 text-white">
                        {userProfile?.username?.charAt(0)?.toUpperCase() || "S"}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <div className="absolute bottom-0 right-0 bg-white rounded-full p-1 border-2 border-black">
                    <PlusCircle className="h-5 w-5 text-black" />
                  </div>
                </div>
              </div>
              <span className="text-xs text-center truncate w-20 text-white">Seu story</span>
            </div>
          )}
          
          {/* Stories */}
          {loading ? (
            // Loading skeletons
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex flex-col items-center space-y-1">
                <div className="h-16 w-16 rounded-full bg-gray-800 animate-pulse" />
                <div className="h-2 w-16 bg-gray-800 rounded animate-pulse" />
              </div>
            ))
          ) : stories.length > 0 ? (
            stories.map(story => (
              <StoryCircle
                key={story.id}
                imageUrl={story.profiles.avatar_url || '/placeholder.svg'}
                username={story.profiles.username}
                isNew={true}
                isViewed={story.viewed}
                isOwn={userId === story.user_id}
                onClick={() => handleStoryClick(story)}
              />
            ))
          ) : (
            <div className="flex items-center justify-center w-full py-2">
              <p className="text-sm text-gray-400">Nenhuma história disponível</p>
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
          onViewed={handleStoryViewed}
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
