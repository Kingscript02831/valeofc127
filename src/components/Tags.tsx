
interface TagsProps {
  content: string;
}

const Tags = ({ content }: TagsProps) => {
  const renderContent = () => {
    // Divide o conteúdo em palavras mantendo os espaços
    const words = content.split(/(\s+)/);
    
    return words.map((word, index) => {
      if (word.startsWith("#")) {
        return (
          <span key={index} className="text-blue-500 font-medium">
            {word}
          </span>
        );
      }
      return word;
    });
  };

  return <>{renderContent()}</>;
};

export default Tags;
