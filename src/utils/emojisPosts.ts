
export const getReactionIcon = (reactionType: string | undefined): string => {
  switch (reactionType) {
    case 'like':
      return '👍';
    case 'love':
      return '❤️';
    case 'haha':
      return '😂';
    case 'wow':
      return '😮';
    case 'sad':
      return '😢';
    case 'angry':
      return '😡';
    default:
      return '';
  }
};
