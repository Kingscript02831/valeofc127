
import { useState, useEffect, useRef } from 'react';
import { cn } from '../lib/utils';
import { reactionsList } from '../utils/emojisPosts';

interface ReactionMenuProps {
  isOpen: boolean;
  onSelect: (type: string) => void;
  currentReaction?: string | null;
}

const ReactionMenu = ({ isOpen, onSelect, currentReaction }: ReactionMenuProps) => {
  const [mounted, setMounted] = useState(false);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const lastScrollY = useRef(0);

  useEffect(() => {
    if (isOpen) {
      setMounted(true);
      // Armazenar a posição de rolagem atual quando o menu abre
      lastScrollY.current = window.scrollY;
      
      // Adicionar event listener para detectar rolagem
      const handleScroll = () => {
        // Se rolou para cima (scrollY menor que o valor anterior)
        if (window.scrollY < lastScrollY.current) {
          // Fechar o menu chamando onSelect com o valor atual
          // Isso simula o usuário clicando no mesmo emoji ou em nenhum
          onSelect(currentReaction || '');
        }
        // Atualizar a posição de rolagem
        lastScrollY.current = window.scrollY;
      };
      
      window.addEventListener('scroll', handleScroll);
      
      return () => {
        // Remover o event listener quando o componente for desmontado
        window.removeEventListener('scroll', handleScroll);
      };
    } else {
      const timer = setTimeout(() => setMounted(false), 200);
      return () => clearTimeout(timer);
    }
  }, [isOpen, onSelect, currentReaction]);

  // Preload images for faster loading
  useEffect(() => {
    let loadedCount = 0;
    const totalImages = reactionsList.length;
    
    reactionsList.forEach(({ emoji }) => {
      const img = new Image();
      img.onload = () => {
        loadedCount++;
        if (loadedCount === totalImages) {
          setImagesLoaded(true);
        }
      };
      img.onerror = () => {
        console.error(`Failed to load emoji: ${emoji}`);
        loadedCount++;
        if (loadedCount === totalImages) {
          setImagesLoaded(true);
        }
      };
      img.src = emoji;
    });
    
    // Fallback in case images don't load
    const timeout = setTimeout(() => {
      if (!imagesLoaded) setImagesLoaded(true);
    }, 2000);
    
    return () => clearTimeout(timeout);
  }, []);

  if (!mounted) return null;

  return (
    <div className={cn(
      "reaction-menu p-3 rounded-xl bg-gray-900/95 border border-gray-800 shadow-lg transition-all duration-200",
      isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
    )}>
      <div className="flex justify-center overflow-x-auto pb-2 px-1 space-x-4 scrollbar-hide" style={{ minWidth: '300px', maxWidth: '95vw' }}>
        {reactionsList.map(({ emoji, type, label }) => (
          <button
            key={type}
            onClick={() => onSelect(type)}
            className={cn(
              "flex flex-col items-center justify-center p-2 rounded-lg transition-all flex-shrink-0 hover:bg-gray-800",
              currentReaction === type && "bg-gray-800 scale-110"
            )}
          >
            <img 
              src={emoji} 
              alt={label} 
              className="w-10 h-10 mb-1 reaction-emoji"
              loading="eager"
            />
            <span className="text-gray-300 text-xs font-medium text-center whitespace-nowrap">
              {label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ReactionMenu;
