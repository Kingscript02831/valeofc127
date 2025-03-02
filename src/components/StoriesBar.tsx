import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../integrations/supabase/client';
import { Avatar } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Story {
  id: string;
  media_url: string;
  media_type: string;
  created_at: string;
  expires_at: string;
  user_id: string;
}

interface StoryUser {
  id: string;
  username: string;
  avatar_url: string;
  hasStories: boolean;
  hasUnviewedStories: boolean;
  stories?: Story[];
}

export const StoriesBar = () => {
  const navigate = useNavigate();
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    // Get current user ID
    const getCurrentUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data?.user) {
        setCurrentUserId(data.user.id);
      }
    };
    getCurrentUser();
  }, []);

  // Fetch users that the current user follows and who have stories
  const { data: followedUsersWithStories, isLoading } = useQuery({
    queryKey: ['followed-users-stories', currentUserId],
    queryFn: async () => {
      if (!currentUserId) return [];

      // Get users that the current user follows
      const { data: followedUsers, error: followError } = await supabase
        .from('follows')
        .select('following_id')
        .eq('follower_id', currentUserId);

      if (followError) {
        console.error('Error fetching followed users:', followError);
        return [];
      }

      // If there are no followed users, return empty array
      if (!followedUsers || followedUsers.length === 0) {
        return [];
      }

      const followingIds = followedUsers.map(follow => follow.following_id);

      // Fetch profiles of followed users
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, username, avatar_url')
        .in('id', followingIds);

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
        return [];
      }

      // For each followed user, check if they have active stories
      const result: StoryUser[] = [];

      // Add current user to beginning of list
      const { data: currentUserProfile } = await supabase
        .from('profiles')
        .select('id, username, avatar_url')
        .eq('id', currentUserId)
        .single();

      if (currentUserProfile) {
        result.push({
          ...currentUserProfile,
          hasStories: false,  // Will be updated below
          hasUnviewedStories: false
        });
      }

      // For followed users, check if they have stories
      for (const profile of profiles || []) {
        // Get active stories for this user
        const now = new Date().toISOString();
        const { data: stories, error: storiesError } = await supabase
          .from('stories')
          .select('id, media_url, media_type, created_at, expires_at, user_id')
          .eq('user_id', profile.id)
          .gte('expires_at', now);

        if (storiesError) {
          console.error(`Error fetching stories for user ${profile.id}:`, storiesError);
          continue;
        }

        if (stories && stories.length > 0) {
          // Check if user has viewed all stories
          const storyIds = stories.map(story => story.id);
          
          const { data: views, error: viewsError } = await supabase
            .from('story_views')
            .select('story_id')
            .eq('viewer_id', currentUserId)
            .in('story_id', storyIds);

          if (viewsError) {
            console.error(`Error fetching story views for user ${profile.id}:`, viewsError);
          }

          const viewedStoryIds = new Set((views || []).map(view => view.story_id));
          const hasUnviewedStories = stories.some(story => !viewedStoryIds.has(story.id));

          result.push({
            ...profile,
            hasStories: true,
            hasUnviewedStories,
            stories
          });
        }
      }

      // Also update current user's story status
      if (currentUserProfile) {
        const now = new Date().toISOString();
        const { data: currentUserStories } = await supabase
          .from('stories')
          .select('id, media_url, media_type, created_at, expires_at, user_id')
          .eq('user_id', currentUserId)
          .gte('expires_at', now);

        if (currentUserStories && currentUserStories.length > 0 && result[0]) {
          result[0].hasStories = true;
          result[0].stories = currentUserStories;
        }
      }

      return result;
    },
    enabled: !!currentUserId
  });

  const handleStoryClick = (user: StoryUser) => {
    if (user.id === currentUserId) {
      // Current user - navigate to story management
      navigate('/StoryManager');
    } else if (user.hasStories) {
      // Other user with stories - navigate to view their stories
      navigate(`/StoryViewer/${user.id}`);
    }
  };

  const handleAddStory = () => {
    navigate('/StoryForm');
  };

  if (isLoading) {
    return (
      <div className="w-full overflow-x-auto py-4 px-2">
        <div className="flex space-x-4">
          {[...Array(5)].map((_, index) => (
            <div key={index} className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-gray-200 animate-pulse"></div>
              <div className="mt-1 w-10 h-2 bg-gray-200 animate-pulse rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // If there are no stories from followed users, don't show the component
  if (!followedUsersWithStories || followedUsersWithStories.length === 0) {
    return null;
  }

  return (
    <div className="w-full bg-white dark:bg-gray-900 pt-16 pb-2">
      <ScrollArea className="w-full whitespace-nowrap">
        <div className="flex space-x-4 px-4 py-2">
          {followedUsersWithStories.map((user) => (
            <div
              key={user.id}
              className="flex flex-col items-center cursor-pointer"
              onClick={() => handleStoryClick(user)}
            >
              <div className={`p-0.5 rounded-full ${
                user.hasStories 
                  ? user.hasUnviewedStories 
                    ? 'bg-gradient-to-tr from-yellow-400 to-fuchsia-600' 
                    : 'bg-gray-300 dark:bg-gray-700' 
                  : ''
              }`}>
                <Avatar className="w-16 h-16 border-2 border-white dark:border-gray-800">
                  <img 
                    src={user.avatar_url || 'https://via.placeholder.com/150'} 
                    alt={user.username}
                    className="object-cover w-full h-full rounded-full"
                  />
                </Avatar>
              </div>
              <span className="text-xs mt-1 font-medium truncate w-16 text-center">
                {user.id === currentUserId ? 'Seu story' : user.username}
              </span>
              {user.id === currentUserId && !user.hasStories && (
                <button 
                  onClick={(e) => { 
                    e.stopPropagation();
                    handleAddStory();
                  }}
                  className="mt-1 text-xs text-blue-600 font-medium"
                >
                  + Adicionar
                </button>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

export default StoriesBar;
