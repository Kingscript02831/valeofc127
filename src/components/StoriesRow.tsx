
import React, { useState, useEffect } from 'react';
import { ScrollArea, ScrollBar } from "./ui/scroll-area";
import StoryCircle from "./StoryCircle";
import StoryViewer from "./StoryViewer";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Story } from '@/types/stories';
import { useNavigate } from 'react-router-dom';

const StoriesRow: React.FC = () => {
  const [viewedStories, setViewedStories] = useState<Record<string, boolean>>({});
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [currentStory, setCurrentStory] = useState<{
    open: boolean;
    username: string;
    imageUrl: string;
    id: string;
  }>({
    open: false,
    username: "",
    imageUrl: "",
    id: ""
  });
  
  const navigate = useNavigate();

  // Function to fetch stories from Supabase
  const fetchStories = async () => {
    try {
      setLoading(true);
      
      // First get the current user
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);
      
      if (user) {
        // Get all stories that haven't expired
        const { data: storiesData, error } = await supabase
          .from('stories')
          .select(`
            *,
            user:user_id (
              username,
              full_name,
              avatar_url
            )
          `)
          .gt('expires_at', new Date().toISOString())
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        // Get all stories that the current user has viewed
        const { data: viewedData, error: viewedError } = await supabase
          .from('story_views')
          .select('story_id')
          .eq('viewer_id', user.id);
        
        if (viewedError) throw viewedError;
        
        // Create a map of viewed stories
        const viewedMap: Record<string, boolean> = {};
        viewedData?.forEach((view) => {
          viewedMap[view.story_id] = true;
        });
        
        setViewedStories(viewedMap);
        
        // Mark which stories have been viewed
        const processedStories = storiesData?.map(story => ({
          ...story,
          viewed: !!viewedMap[story.id]
        })) || [];
        
        setStories(processedStories);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching stories:', error);
      setLoading(false);
      toast.error('Erro ao carregar stories');
    }
  };

  useEffect(() => {
    fetchStories();
    
    // Set up a subscription to refresh stories when they change
    const storiesSubscription = supabase
      .channel('stories_changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'stories' 
      }, () => {
        fetchStories();
      })
      .subscribe();
    
    return () => {
      storiesSubscription.unsubscribe();
    };
  }, []);

  // Group stories by user (latest story per user)
  const userStories: Record<string, Story> = {};
  stories.forEach(story => {
    if (!userStories[story.user_id] || 
        new Date(story.created_at) > new Date(userStories[story.user_id].created_at)) {
      userStories[story.user_id] = story;
    }
  });

  const handleStoryClick = (storyId: string, username: string, imageUrl: string) => {
    if (storyId === "own") {
      navigate('/add-story');
    } else {
      // Open the story viewer
      setCurrentStory({
        open: true,
        username,
        imageUrl,
        id: storyId
      });
      
      // Mark as viewed
      setViewedStories(prev => ({...prev, [storyId]: true}));
    }
  };
  
  const handleCloseStory = () => {
    setCurrentStory({...currentStory, open: false});
  };
  
  if (loading) {
    return (
      <div className="w-full py-2">
        <ScrollArea className="w-full whitespace-nowrap">
          <div className="flex space-x-4 px-4 py-2">
            {Array(5).fill(0).map((_, i) => (
              <div key={i} className="flex flex-col items-center space-y-1">
                <div className="h-16 w-16 rounded-full bg-gray-300 dark:bg-gray-700 animate-pulse" />
                <div className="h-2 w-16 bg-gray-300 dark:bg-gray-700 animate-pulse" />
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
    );
  }
  
  // For the "add your story" circle
  const ownStoryCircle = currentUser && (
    <StoryCircle
      key="own"
      imageUrl={currentUser?.user_metadata?.avatar_url || "/placeholder.svg"}
      username="Seu story"
      isOwn={true}
      onClick={() => navigate('/add-story')}
    />
  );
  
  return (
    <div className="w-full py-2">
      <ScrollArea className="w-full whitespace-nowrap">
        <div className="flex space-x-4 px-4 py-2">
          {/* First item - Add your story */}
          {ownStoryCircle}
          
          {/* User stories */}
          {Object.values(userStories).map((story) => (
            <StoryCircle
              key={story.id}
              imageUrl={story.user?.avatar_url || "/placeholder.svg"}
              username={story.user?.username || "Usuário"}
              isNew={true}
              isViewed={story.viewed}
              onClick={() => handleStoryClick(
                story.id, 
                story.user?.username || "Usuário", 
                story.media_url
              )}
            />
          ))}
        </div>
        <ScrollBar orientation="horizontal" className="hidden" />
      </ScrollArea>
      
      {currentStory.open && (
        <StoryViewer
          isOpen={currentStory.open}
          onClose={handleCloseStory}
          username={currentStory.username}
          imageUrl={currentStory.imageUrl}
          storyId={currentStory.id}
        />
      )}
    </div>
  );
};

export default StoriesRow;
