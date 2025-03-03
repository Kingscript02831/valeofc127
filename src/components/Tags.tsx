
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface TagsProps {
  content: string;
  className?: string;
  linkClassName?: string;
  hashtagClassName?: string;
  disableLinks?: boolean;
}

const Tags = ({ 
  content, 
  className, 
  linkClassName = "text-[#0EA5E9] font-medium hover:underline", 
  hashtagClassName = "text-blue-500 font-medium",
  disableLinks = false
}: TagsProps) => {
  const renderContent = () => {
    // Regular expression to match both hashtags and username mentions
    const regex = /(\s|^)([#@]\w+)/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    // Find all matches of hashtags and mentions
    while ((match = regex.exec(content)) !== null) {
      const spacing = match[1]; // Capture the spacing before the tag
      const tag = match[2]; // The actual tag including # or @
      const matchStart = match.index;
      const matchEnd = matchStart + match[0].length;

      // Add the text before this match
      if (matchStart > lastIndex) {
        const textBefore = content.substring(lastIndex, matchStart);
        // Preserve line breaks by replacing them with <br/> elements
        const formattedText = textBefore.split('\n').map((line, i, arr) => 
          i === arr.length - 1 ? line : (
            <>
              {line}
              <br />
            </>
          )
        );
        parts.push(<span key={`text-${lastIndex}`}>{formattedText}</span>);
      }

      // Add the spacing
      parts.push(spacing);

      // Add the tag with appropriate styling
      if (tag.startsWith('#')) {
        parts.push(
          <span key={matchStart} className={cn(hashtagClassName)}>
            {tag}
          </span>
        );
      } else if (tag.startsWith('@')) {
        // For @username, create a link to their profile
        const username = tag.substring(1); // Remove the @ symbol
        
        if (disableLinks) {
          parts.push(
            <span key={matchStart} className={cn(linkClassName)}>
              {tag}
            </span>
          );
        } else {
          parts.push(
            <Link 
              key={matchStart} 
              to={`/perfil/${username}`} 
              className={cn(linkClassName)}
            >
              {tag}
            </Link>
          );
        }
      }

      lastIndex = matchEnd;
    }

    // Add the remaining text
    if (lastIndex < content.length) {
      const textAfter = content.substring(lastIndex);
      // Preserve line breaks here too
      const formattedText = textAfter.split('\n').map((line, i, arr) => 
        i === arr.length - 1 ? line : (
          <>
            {line}
            <br />
          </>
        )
      );
      parts.push(<span key={`text-end`}>{formattedText}</span>);
    }

    return parts;
  };

  return <div className={className}>{renderContent()}</div>;
};

export default Tags;
