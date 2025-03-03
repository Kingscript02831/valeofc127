
import React from 'react';
import { useNavigate } from 'react-router-dom';

interface TagsProps {
  content: string;
}

const Tags: React.FC<TagsProps> = ({ content }) => {
  const navigate = useNavigate();
  
  // This function processes the text and converts @mentions to clickable elements
  const processText = () => {
    if (!content) return [];
    
    // Regular expression to find @username mentions
    const mentionRegex = /\B@(\w+)/g;
    
    // Split the text by the mention patterns
    const parts = content.split(mentionRegex);
    
    // Process each part and construct the result
    const result = [];
    let i = 0;
    
    // For each part, determine if it's a username or regular text
    while (i < parts.length) {
      // Regular text
      if (parts[i]) {
        result.push(
          <span key={`text-${i}`}>{parts[i]}</span>
        );
      }
      
      // Username (if available)
      if (i + 1 < parts.length) {
        const username = parts[i + 1];
        result.push(
          <button
            key={`mention-${i}`}
            className="text-primary font-medium hover:underline"
            onClick={() => navigate(`/perfil/${username}`)}
          >
            @{username}
          </button>
        );
        i += 2;  // Skip the username part
      } else {
        i++;
      }
    }
    
    return result;
  };
  
  return <>{processText()}</>;
};

export default Tags;
