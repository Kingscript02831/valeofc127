import React, { useEffect, useState } from 'react';
import StoryCircle from '@/components/StoryCircle';
import StoryViewer from '@/components/StoryViewer';
import PhotoUrlDialog from '@/components/PhotoUrlDialog';
import { useNavigate } from 'react-router-dom';
import { supabase } from "../integrations/supabase/client"; // Fixed path
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"; // Add Avatar components import

interface Story {
  id: string;
  user_id: string;
  media_url: string;
  created_at: string;
  media_type: 'image' | 'video';
}

interface UserProfile {
  id: string;
  username: string;
  avatar_url: string;
}

const StoriesRow = () => {
  const [stories, setStories] = useState<Story[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [photoUrlDialogOpen, setPhotoUrlDialogOpen] = useState(false);
  const [newStoryUrl, setNewStoryUrl] = useState('');
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStories = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          setCurrentUserId(session.user.id);
        }

        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('id, username, avatar_url');

        if (profilesError) {
          console.error("Error fetching profiles:", profilesError);
          return;
        }

        setUsers(profiles || []);

        const { data: storiesData, error: storiesError } = await supabase
          .from('stories')
          .select('*')
          .order('created_at', { ascending: false });

        if (storiesError) {
          console.error("Error fetching stories:", storiesError);
          return;
        }

        setStories(storiesData || []);
      } catch (error) {
        console.error("Unexpected error:", error);
      }
    };

    fetchStories();
  }, []);

  const openViewer = (story: Story) => {
    setSelectedStory(story);
    setViewerOpen(true);
  };

  const closeViewer = () => {
    setViewerOpen(false);
    setSelectedStory(null);
  };

  const handleAddPhoto = async () => {
    if (!newStoryUrl) {
      alert('Please enter a valid URL.');
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/login');
        return;
      }

      const { error } = await supabase
        .from('stories')
        .insert([
          {
            user_id: user.id,
            media_url: newStoryUrl,
            media_type: 'image',
          },
        ]);

      if (error) {
        throw error;
      }

      setNewStoryUrl('');
      setPhotoUrlDialogOpen(false);

      const { data: storiesData, error: storiesError } = await supabase
        .from('stories')
        .select('*')
        .order('created_at', { ascending: false });

      if (storiesError) {
        console.error("Error fetching stories:", storiesError);
        return;
      }

      setStories(storiesData || []);

    } catch (error) {
      console.error("Error adding story:", error);
      alert('Failed to add story.');
    }
  };

  const userHasStory = (userId: string): boolean => {
    return stories.some(story => story.user_id === userId);
  };

  const getUserStories = (userId: string): Story[] => {
    return stories.filter(story => story.user_id === userId);
  };

  const getProfile = (userId: string): UserProfile | undefined => {
    return users.find(profile => profile.id === userId);
  };

  return (
    <div className="stories-row">
      <div className="stories-container">
        <div key="add-story" className="story-item">
          <button onClick={() => setPhotoUrlDialogOpen(true)} className="add-story-button">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="24" cy="24" r="23" stroke="#C6C6C6" strokeWidth="2" />
              <path d="M24 14V34" stroke="#C6C6C6" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M14 24H34" stroke="#C6C6C6" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <span className="story-username">Adicionar</span>
        </div>
        {users.map(user => {
          const hasStory = userHasStory(user.id);
          return (
            <div key={user.id} className="story-item">
              <button
                onClick={() => {
                  const userStories = getUserStories(user.id);
                  if (userStories.length > 0) {
                    openViewer(userStories[0]);
                  }
                }}
                className="story-button"
              >
                <Avatar className="h-12 w-12">
                  <AvatarImage src={user.avatar_url} alt={user.username} />
                  <AvatarFallback>{user.username?.[0]?.toUpperCase() || "U"}</AvatarFallback>
                </Avatar>
              </button>
              <span className="story-username">{user.username}</span>
            </div>
          );
        })}
      </div>

      {viewerOpen && selectedStory && (
        <StoryViewer story={selectedStory} onClose={closeViewer} stories={stories} getProfile={getProfile} />
      )}

      <PhotoUrlDialog
        open={photoUrlDialogOpen}
        onClose={() => setPhotoUrlDialogOpen(false)}
        newStoryUrl={newStoryUrl}
        setNewStoryUrl={setNewStoryUrl}
        handleAddPhoto={handleAddPhoto}
      />
    </div>
  );
};

export default StoriesRow;
