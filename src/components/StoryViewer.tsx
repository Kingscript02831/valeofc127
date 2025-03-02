
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent } from "./ui/dialog";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";
import { X } from "lucide-react";

interface StoryViewerProps {
  isOpen: boolean;
  onClose: () => void;
  username: string;
  imageUrl: string;
  storyId?: string;
}

const StoryViewer: React.FC<StoryViewerProps> = ({
  isOpen,
  onClose,
  username,
  imageUrl,
  storyId
}) => {
  const [progress, setProgress] = useState(0);
  
  useEffect(() => {
    if (isOpen) {
      setProgress(0);
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setTimeout(() => onClose(), 300);
            return 100;
          }
          return prev + 1;
        });
      }, 50); // 5 seconds total duration
      
      return () => clearInterval(interval);
    }
  }, [isOpen, onClose]);
  
  // Determine if it's a video or image based on file extension
  const isVideo = imageUrl && (
    imageUrl.toLowerCase().endsWith('.mp4') || 
    imageUrl.toLowerCase().endsWith('.mov') || 
    imageUrl.toLowerCase().includes('video')
  );
  
  return (
    <Dialog open={isOpen} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-md p-0 rounded-lg overflow-hidden bg-black border-none">
        <div className="relative h-[80vh] flex flex-col">
          {/* Progress bar */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gray-700 z-10">
            <div 
              className="h-full bg-white transition-all duration-50"
              style={{ width: `${progress}%` }}
            />
          </div>
          
          {/* User info */}
          <div className="absolute top-0 left-0 right-0 p-4 z-10 flex items-center justify-between bg-gradient-to-b from-black/60 to-transparent">
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={imageUrl} alt={username} />
                <AvatarFallback>{username?.charAt(0)?.toUpperCase()}</AvatarFallback>
              </Avatar>
              <span className="text-white font-medium text-sm">{username}</span>
              <span className="text-gray-300 text-xs">agora</span>
            </div>
            <button onClick={onClose} className="text-white">
              <X size={20} />
            </button>
          </div>
          
          {/* Story content */}
          <div className="flex-1 flex items-center justify-center bg-gray-900">
            {isVideo ? (
              <video 
                src={imageUrl} 
                className="w-full h-full object-contain"
                autoPlay
                loop
                muted
                controls
              />
            ) : (
              <img 
                src={imageUrl} 
                alt="Story" 
                className="w-full h-full object-contain"
              />
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default StoryViewer;
