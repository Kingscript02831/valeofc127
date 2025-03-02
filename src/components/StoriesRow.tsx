
import React from 'react';
import { ScrollArea, ScrollBar } from "./ui/scroll-area";
import StoryCircle from "./StoryCircle";
import { toast } from "sonner";

// Mock data for stories
const MOCK_STORIES = [
  { id: "own", imageUrl: "/placeholder.svg", username: "Seu story", isOwn: true, isNew: false },
  { id: "1", imageUrl: "https://i.pravatar.cc/150?img=1", username: "glaucia_araujo...", isNew: true },
  { id: "2", imageUrl: "https://i.pravatar.cc/150?img=2", username: "mellyyzw", isNew: true },
  { id: "3", imageUrl: "https://i.pravatar.cc/150?img=3", username: "_nar.aa", isNew: false },
  { id: "4", imageUrl: "https://i.pravatar.cc/150?img=4", username: "marcos.v", isNew: true },
  { id: "5", imageUrl: "https://i.pravatar.cc/150?img=5", username: "carolina_r", isNew: false },
  { id: "6", imageUrl: "https://i.pravatar.cc/150?img=6", username: "pedro_s", isNew: true },
  { id: "7", imageUrl: "https://i.pravatar.cc/150?img=7", username: "julia.costa", isNew: false },
];

const StoriesRow: React.FC = () => {
  const handleStoryClick = (storyId: string, username: string) => {
    if (storyId === "own") {
      toast.info("Criar novo story", {
        description: "Esta funcionalidade será implementada em breve"
      });
    } else {
      toast.info(`Ver story de ${username}`, {
        description: "Esta funcionalidade será implementada em breve"
      });
    }
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
              onClick={() => handleStoryClick(story.id, story.username)}
            />
          ))}
        </div>
        <ScrollBar orientation="horizontal" className="hidden" />
      </ScrollArea>
    </div>
  );
};

export default StoriesRow;
