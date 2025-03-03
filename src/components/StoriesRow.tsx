
import React, { useState } from 'react';
import { ScrollArea, ScrollBar } from "./ui/scroll-area";
import StoryCircle from "./StoryCircle";
import { toast } from "sonner";

// Mock data for stories with profile pictures
const MOCK_STORIES = [
  { id: "own", imageUrl: "/placeholder.svg", username: "Seu story", isOwn: true, isNew: false },
  { id: "1", imageUrl: "https://i.pravatar.cc/150?img=1", username: "glaucia_araujo", isNew: true },
  { id: "2", imageUrl: "https://i.pravatar.cc/150?img=2", username: "mellyyzw", isNew: true },
  { id: "3", imageUrl: "https://i.pravatar.cc/150?img=3", username: "_nar.aa", isNew: true },
  { id: "4", imageUrl: "https://i.pravatar.cc/150?img=4", username: "marcos.v", isNew: true },
  { id: "5", imageUrl: "https://i.pravatar.cc/150?img=5", username: "carolina_r", isNew: true },
  { id: "6", imageUrl: "https://i.pravatar.cc/150?img=6", username: "pedro_s", isNew: true },
  { id: "7", imageUrl: "https://i.pravatar.cc/150?img=7", username: "julia.costa", isNew: true },
];

const StoriesRow: React.FC = () => {
  const [viewedStories, setViewedStories] = useState<Record<string, boolean>>({});
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
  
  const handleStoryClick = (storyId: string, username: string, imageUrl: string) => {
    if (storyId === "own") {
      toast.info("Criar novo story", {
        description: "Esta funcionalidade será implementada em breve"
      });
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
  
  return (
    <div className="w-full py-2">
      <ScrollArea className="w-full whitespace-nowrap">
        <div className="flex space-x-4 px-4 py-2">
          {MOCK_STORIES.map((story) => (
            <StoryCircle
              key={story.id}
              imageUrl={story.imageUrl}
              username={story.username}
              isNew={story.isNew}
              isOwn={story.isOwn}
              isViewed={viewedStories[story.id]}
              onClick={() => handleStoryClick(story.id, story.username, story.imageUrl)}
            />
          ))}
        </div>
        <ScrollBar orientation="horizontal" className="hidden" />
      </ScrollArea>
      
      {currentStory.open && (
        <div className="fixed inset-0 z-50 bg-black flex flex-col">
          {/* Story header */}
          <div className="p-4 flex items-center justify-between bg-gradient-to-b from-black/60 to-transparent absolute top-0 left-0 right-0 z-10">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full overflow-hidden">
                <img 
                  src={currentStory.imageUrl}
                  alt={currentStory.username}
                  className="h-full w-full object-cover"
                />
              </div>
              <span className="text-white font-medium">{currentStory.username}</span>
            </div>
            <button 
              onClick={handleCloseStory}
              className="text-white p-1"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6 6 18" /><path d="m6 6 12 12" />
              </svg>
            </button>
          </div>
          
          {/* Story image */}
          <div className="flex-1 flex items-center justify-center">
            <img 
              src={currentStory.imageUrl}
              alt={currentStory.username}
              className="max-h-full w-auto object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default StoriesRow;
