
export const getReactionIcon = (type: string) => {
  switch (type) {
    case 'like':
      return '/curtidas1.png';
    case 'love':
      return '/amei1.png';
    case 'haha':
      return '/haha1.png';
    case 'wow':
      return '/uau1.png';
    case 'sad':
      return '/triste1.png';
    case 'angry':
      return '/ggr1.png';
    default:
      return '/curtidas1.png';
  }
};

export const reactionsList = [
  { emoji: '/curtidas1.png', type: 'like', label: 'Curtir' },
  { emoji: '/amei1.png', type: 'love', label: 'Amei' },
  { emoji: '/haha1.png', type: 'haha', label: 'Haha' },
  { emoji: '/uau1.png', type: 'wow', label: 'Uau' },
  { emoji: '/triste1.png', type: 'sad', label: 'Triste' },
  { emoji: '/ggr1.png', type: 'angry', label: 'Grr' }
];
