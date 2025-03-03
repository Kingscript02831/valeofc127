
import { Link } from 'react-router-dom';

interface TagsProps {
  content: string;
}

const Tags = ({ content }: TagsProps) => {
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
        parts.push(content.substring(lastIndex, matchStart));
      }

      // Add the spacing
      parts.push(spacing);

      // Add the tag with appropriate styling
      if (tag.startsWith('#')) {
        parts.push(
          <span key={matchStart} className="text-blue-500 font-medium">
            {tag}
          </span>
        );
      } else if (tag.startsWith('@')) {
        // For @username, create a link to their profile
        const username = tag.substring(1); // Remove the @ symbol
        parts.push(
          <Link 
            key={matchStart} 
            to={`/perfil/${username}`} 
            className="text-[#0EA5E9] font-medium hover:underline"
          >
            {tag}
          </Link>
        );
      }

      lastIndex = matchEnd;
    }

    // Add the remaining text
    if (lastIndex < content.length) {
      parts.push(content.substring(lastIndex));
    }

    return parts;
  };

  return <>{renderContent()}</>;
};

export default Tags;
