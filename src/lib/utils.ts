
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
 
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | number | Date): string {
  const now = new Date();
  const postDate = new Date(date);
  const diffInMinutes = Math.floor((now.getTime() - postDate.getTime()) / (1000 * 60));
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInMinutes < 1) {
    return 'Agora mesmo';
  } else if (diffInMinutes < 60) {
    return `${diffInMinutes} min`;
  } else if (diffInHours < 24) {
    return `${diffInHours}h`;
  } else if (diffInDays < 7) {
    return `${diffInDays}d`;
  } else {
    return postDate.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  }
}

export function getReactionEmoji(type: string) {
  switch (type) {
    case 'like':
      return '👍';
    case 'love':
      return '❤️';
    case 'haha':
      return '😂';
    case 'fire':
      return '🔥';
    case 'angry':
      return '🤬';
    default:
      return '👍';
  }
}
