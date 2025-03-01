
export const getReactionIcon = (type: string) => {
  switch (type) {
    case 'like':
      return '👍';
    case 'love':
      return '❤️';
    case 'haha':
      return '😂';
    case 'fire':
      return '🔥';
    case 'sad':
      return '🥲';
    case 'angry':
      return '🤬';
    default:
      return '👍';
  }
};

export const reactionsList = [
  { emoji: '👍', type: 'like', label: 'Curtir' },
  { emoji: '❤️', type: 'love', label: 'Amei' },
  { emoji: '😂', type: 'haha', label: 'Haha' },
  { emoji: '🔥', type: 'fire', label: 'Fogo' },
  { emoji: '🥲', type: 'sad', label: 'Triste' },
  { emoji: '🤬', type: 'angry', label: 'Grr' },
];
