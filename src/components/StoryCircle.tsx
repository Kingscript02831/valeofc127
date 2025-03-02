
import React from 'react';

interface StoryCircleProps {
  imageUrl: string;
  username: string;
  isNew?: boolean;
  isOwn?: boolean;
  isViewed?: boolean;
}

const StoryCircle: React.FC<StoryCircleProps> = ({ imageUrl, username, isNew = false, isOwn = false, isViewed = false }) => {
  const borderColor = isOwn 
    ? 'border-gray-300 dark:border-gray-600' 
    : isViewed
      ? 'border-gray-400' 
      : 'border-gradient-to-r from-pink-500 to-orange-500';

  const ringClasses = isOwn 
    ? '' 
    : isNew && !isViewed
      ? 'ring-2 ring-primary dark:ring-primary'
      : '';

  return (
    <div className="flex flex-col items-center space-y-1">
      <div className={`story-circle ${isNew && !isViewed ? 'has-story' : ''} ${isViewed ? 'viewed' : ''}`}>
        <div className={`relative w-16 h-16 rounded-full overflow-hidden ${ringClasses}`}>
          {isOwn && (
            <div className="absolute bottom-0 right-0 bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center z-10 border-2 border-white dark:border-gray-900">
              <span className="text-xs font-bold">+</span>
            </div>
          )}
          <img 
            src={imageUrl} 
            alt={username} 
            className="w-full h-full object-cover" 
          />
        </div>
      </div>
      <span className="text-xs truncate max-w-[64px] text-center dark:text-gray-300">
        {username}
      </span>
    </div>
  );
};

export default StoryCircle;
