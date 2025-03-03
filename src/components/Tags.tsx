
import React from 'react';
import { Link } from 'react-router-dom';

interface TagsProps {
  content: string;
  disableLinks?: boolean;
  className?: string;
}

const Tags: React.FC<TagsProps> = ({ content, disableLinks = false, className = '' }) => {
  if (!content) return null;

  // Parse content to identify tags, mentions and links
  const formatContent = (text: string) => {
    // Replace hashtags with links
    let formattedText = text.replace(
      /#(\w+)/g,
      disableLinks 
        ? '<span class="text-blue-400">$&</span>' 
        : '<a href="/tags/$1" class="text-blue-400 hover:underline">$&</a>'
    );

    // Replace mentions with links
    formattedText = formattedText.replace(
      /@(\w+)/g,
      disableLinks 
        ? '<span class="text-purple-400">$&</span>' 
        : '<a href="/perfil/$1" class="text-purple-400 hover:underline">$&</a>'
    );

    return formattedText;
  };

  const formattedContent = formatContent(content);

  return (
    <span 
      className={className}
      dangerouslySetInnerHTML={{ __html: formattedContent }}
    />
  );
};

export default Tags;
