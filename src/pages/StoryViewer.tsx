
import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Story } from "@/types/story";
import { X, ChevronLeft, ChevronRight, Heart, Send, MessageCircle } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";

export default function StoryViewer() {
  const { userId } = useParams();
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [paused, setPaused] = useState(false);
  const [userData, setUserData] = useState<{ username: string; avatar_url: string | null } | null>(null);
  
  const navigate = useNavigate();
  const progressInterval = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    fetchStories();
    return () => {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
    };
  }, [userId]);

  useEffect(() => {
    if (stories.length > 0) {
      startProgressTimer();
    }
    return () => {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
    };
  }, [currentIndex, stories, paused]);

  const fetchStories = async () => {
    try {
      setLoading(true);
      
      // Buscar dados do usuário
      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select('username, avatar_url')
        .eq('id', userId)
        .single();
      
      if (userError) throw userError;
      setUserData(userData);
      
      // Buscar stories do usuário que ainda não expiraram
      const { data: storiesData, error: storiesError } = await supabase
        .from('stories')
        .select('*')
        .eq('user_id', userId)
        .filter('expires_at', 'gt', new Date().toISOString())
        .order('created_at', { ascending: true });
      
      if (storiesError) throw storiesError;
      
      if (storiesData && storiesData.length > 0) {
        setStories(storiesData);
      } else {
        // Se não houver stories, voltar para a página inicial
        navigate('/');
      }
    } catch (error) {
      console.error('Erro ao buscar stories:', error);
    } finally {
      setLoading(false);
    }
  };

  const startProgressTimer = () => {
    if (progressInterval.current) {
      clearInterval(progressInterval.current);
    }
    
    if (paused) return;
    
    setProgress(0);
    
    const duration = 5000; // 5 segundos por story
    const interval = 50; // atualizar a cada 50ms
    const increment = (interval / duration) * 100;
    
    progressInterval.current = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval.current!);
          
          // Passar para o próximo story ou fechar se for o último
          if (currentIndex < stories.length - 1) {
            setCurrentIndex(currentIndex + 1);
          } else {
            navigate('/');
          }
          
          return 0;
        }
        return prev + increment;
      });
    }, interval);
  };

  const handleNext = () => {
    if (currentIndex < stories.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      navigate('/');
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleTouch = (e: React.TouchEvent | React.MouseEvent) => {
    const touchX = 'touches' in e 
      ? e.touches[0].clientX 
      : ('clientX' in e ? e.clientX : 0);
    
    const screenWidth = window.innerWidth;
    
    if (touchX < screenWidth / 3) {
      handlePrevious();
    } else if (touchX > (screenWidth * 2) / 3) {
      handleNext();
    } else {
      setPaused(!paused);
    }
  };

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-black">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (stories.length === 0) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-black text-white">
        <p>Nenhum story encontrado</p>
        <button 
          className="mt-4 px-4 py-2 bg-blue-600 rounded-lg"
          onClick={() => navigate('/')}
        >
          Voltar
        </button>
      </div>
    );
  }

  const currentStory = stories[currentIndex];
  const formattedTime = new Date(currentStory.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  
  return (
    <div 
      className="h-screen w-screen flex flex-col relative bg-black"
      onTouchStart={handleTouch}
      onClick={handleTouch}
    >
      {/* Progress bars */}
      <div className="absolute top-0 left-0 right-0 z-10 flex gap-1 p-2">
        {stories.map((_, index) => (
          <Progress 
            key={index} 
            value={index === currentIndex ? progress : index < currentIndex ? 100 : 0} 
            className="h-1 flex-1 bg-gray-600"
          />
        ))}
      </div>
      
      {/* User info */}
      <div className="absolute top-4 left-0 right-0 z-10 flex items-center justify-between px-4 mt-2">
        <div className="flex items-center gap-2">
          <button onClick={(e) => { e.stopPropagation(); navigate('/'); }}>
            <X className="text-white" />
          </button>
          <Avatar className="w-8 h-8">
            <AvatarImage src={userData?.avatar_url || "/placeholder.svg"} />
            <AvatarFallback>{userData?.username?.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="text-white">
            <p className="text-sm font-semibold">{userData?.username}</p>
            <p className="text-xs opacity-80">{formattedTime}</p>
          </div>
        </div>
      </div>
      
      {/* Media content */}
      <div className="flex-1 flex items-center justify-center">
        {currentStory.media_type === 'image' ? (
          <img 
            src={currentStory.media_url} 
            alt="Story" 
            className="max-h-full max-w-full object-contain"
          />
        ) : (
          <video 
            src={currentStory.media_url} 
            autoPlay 
            playsInline 
            muted={false}
            controls={false}
            className="max-h-full max-w-full object-contain"
            onPlay={() => setPaused(false)}
            onPause={() => setPaused(true)}
          />
        )}
      </div>
      
      {/* Caption */}
      {currentStory.caption && (
        <div className="absolute bottom-24 left-0 right-0 text-white text-center px-6">
          <p className="text-lg drop-shadow-lg">{currentStory.caption}</p>
        </div>
      )}
      
      {/* Navigation buttons for desktop */}
      <button 
        className="absolute top-1/2 left-2 -translate-y-1/2 bg-black/30 rounded-full p-1 hidden md:block"
        onClick={(e) => { e.stopPropagation(); handlePrevious(); }}
      >
        <ChevronLeft className="text-white" />
      </button>
      
      <button 
        className="absolute top-1/2 right-2 -translate-y-1/2 bg-black/30 rounded-full p-1 hidden md:block"
        onClick={(e) => { e.stopPropagation(); handleNext(); }}
      >
        <ChevronRight className="text-white" />
      </button>
      
      {/* Interaction buttons */}
      <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-6 text-white">
        <button className="flex flex-col items-center">
          <Heart className="h-7 w-7" />
          <span className="text-xs mt-1">Curtir</span>
        </button>
        <button className="flex flex-col items-center">
          <MessageCircle className="h-7 w-7" />
          <span className="text-xs mt-1">Comentar</span>
        </button>
        <button className="flex flex-col items-center">
          <Send className="h-7 w-7" />
          <span className="text-xs mt-1">Enviar</span>
        </button>
      </div>
    </div>
  );
}
