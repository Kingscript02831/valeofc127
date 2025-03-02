
import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface StoryViewerProps {
  isOpen: boolean;
  onClose: () => void;
  username: string;
  imageUrl: string;
  storyId: string;
}

const StoryViewer: React.FC<StoryViewerProps> = ({ 
  isOpen, 
  onClose, 
  username, 
  imageUrl,
  storyId 
}) => {
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      setProgress(0);
      const timer = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(timer);
            setTimeout(() => {
              onClose();
            }, 300);
            return 100;
          }
          return prev + 1;
        });
      }, 80); // Approximately 8 seconds to reach 100%

      return () => clearInterval(timer);
    }
  }, [isOpen, onClose]);

  const handleImageLoad = () => {
    setLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="story-viewer">
      <div className="absolute top-0 left-0 right-0 z-20">
        <div className="story-progress-bar">
          <div className="story-progress-fill" style={{ width: `${progress}%` }} />
        </div>
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-2 text-white">
            <div className="w-8 h-8 rounded-full overflow-hidden">
              <img src={imageUrl} alt={username} className="w-full h-full object-cover" />
            </div>
            <span className="font-medium">{username}</span>
          </div>
          <button onClick={onClose} className="text-white hover:text-gray-300 transition-colors p-1">
            <X className="h-6 w-6" />
          </button>
        </div>
      </div>
      
      <div className="w-full h-full flex items-center justify-center bg-black p-4">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-gray-300 border-t-primary rounded-full animate-spin"></div>
          </div>
        )}
        <img 
          src={imageUrl} 
          alt="Story" 
          className="max-w-full max-h-full object-contain"
          onLoad={handleImageLoad}
        />
      </div>
    </div>
  );
};

export default StoryViewer;
