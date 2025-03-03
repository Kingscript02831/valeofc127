
import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { X, ChevronLeft, ChevronRight, Trash2 } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "../components/ui/avatar";
import { Button } from "../components/ui/button";
import { toast } from "sonner";

interface Story {
  id: string;
  user_id: string;
  media_url: string;
  media_type: string;
  created_at: string;
  expires_at: string;
  user?: {
    username: string;
    avatar_url: string;
  };
}

const StoryViewer = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const progressInterval = useRef<NodeJS.Timeout | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Verificar se o usuário atual é o dono das histórias
  const { data: currentUser } = useQuery({
    queryKey: ["currentUser"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      
      return user;
    },
  });

  const isOwner = currentUser?.id === userId;

  // Buscar histórias do usuário
  const { data: stories, isLoading } = useQuery({
    queryKey: ["viewStories", userId],
    queryFn: async () => {
      if (!userId) return [];

      const { data: userData, error: userError } = await supabase
        .from("profiles")
        .select("username, avatar_url")
        .eq("id", userId)
        .single();

      if (userError) throw userError;

      const { data, error } = await supabase
        .from("stories")
        .select("*")
        .eq("user_id", userId)
        .gt("expires_at", new Date().toISOString())
        .order("created_at");

      if (error) throw error;

      // Adicionar as informações do usuário a cada história
      return data.map((story: Story) => ({
        ...story,
        user: userData
      }));
    },
    enabled: !!userId,
  });

  // Mutação para marcar uma história como visualizada
  const markAsViewedMutation = useMutation({
    mutationFn: async (storyId: string) => {
      if (!currentUser || isOwner) return;

      const { error } = await supabase
        .from("story_views")
        .upsert({
          story_id: storyId,
          viewer_id: currentUser.id,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userStories"] });
    },
  });

  // Mutação para excluir uma história
  const deleteStoryMutation = useMutation({
    mutationFn: async (storyId: string) => {
      const { error } = await supabase
        .from("stories")
        .delete()
        .eq("id", storyId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userStories"] });
      queryClient.invalidateQueries({ queryKey: ["viewStories"] });
      toast.success("História excluída com sucesso");
      
      // Se não há mais histórias, voltar para a página inicial
      if (stories && stories.length <= 1) {
        navigate("/");
      }
    },
    onError: (error) => {
      console.error("Error deleting story:", error);
      toast.error("Erro ao excluir história");
    },
  });

  // Iniciar o temporizador de progresso
  useEffect(() => {
    if (isLoading || !stories || stories.length === 0) return;

    // Limpar qualquer intervalo anterior
    if (progressInterval.current) {
      clearInterval(progressInterval.current);
    }

    // Marcar a história atual como visualizada
    if (stories[currentStoryIndex]) {
      markAsViewedMutation.mutate(stories[currentStoryIndex].id);
    }

    // Se for um vídeo, usar a duração do vídeo como temporizador
    if (videoRef.current && stories[currentStoryIndex]?.media_type === 'video') {
      // Os eventos do vídeo lidarão com o progresso
      setProgress(0);
      return;
    }

    // Configurar um temporizador para imagens (5 segundos)
    const duration = 5000; // 5 segundos por história
    const interval = 50; // Atualizar a cada 50ms para suavidade
    const step = (interval / duration) * 100;
    
    setProgress(0);
    
    progressInterval.current = setInterval(() => {
      setProgress((prev) => {
        const newProgress = prev + step;
        if (newProgress >= 100) {
          goToNextStory();
          return 0;
        }
        return newProgress;
      });
    }, interval);

    return () => {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
    };
  }, [currentStoryIndex, isLoading, stories]);

  // Manipular eventos de vídeo
  const handleVideoProgress = () => {
    if (!videoRef.current) return;
    
    const { currentTime, duration } = videoRef.current;
    const calculatedProgress = (currentTime / duration) * 100;
    setProgress(calculatedProgress);
  };

  const handleVideoEnded = () => {
    goToNextStory();
  };

  // Navegar para a próxima história
  const goToNextStory = () => {
    if (!stories || stories.length === 0) return;
    
    if (currentStoryIndex < stories.length - 1) {
      setCurrentStoryIndex(currentStoryIndex + 1);
    } else {
      // Voltar para a tela anterior quando terminar todas as histórias
      navigate(-1);
    }
  };

  // Navegar para a história anterior
  const goToPrevStory = () => {
    if (currentStoryIndex > 0) {
      setCurrentStoryIndex(currentStoryIndex - 1);
    }
  };

  // Manipular a exclusão de uma história
  const handleDeleteStory = () => {
    if (!stories) return;
    
    if (confirm("Tem certeza que deseja excluir esta história?")) {
      deleteStoryMutation.mutate(stories[currentStoryIndex].id);
    }
  };

  // Se estiver carregando ou não houver histórias, mostrar um estado de carregamento
  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

  if (!stories || stories.length === 0) {
    return (
      <div className="fixed inset-0 bg-black flex flex-col items-center justify-center text-white">
        <p className="text-xl mb-4">Não há histórias para mostrar</p>
        <Button onClick={() => navigate(-1)}>Voltar</Button>
      </div>
    );
  }

  const currentStory = stories[currentStoryIndex];

  return (
    <div className="fixed inset-0 bg-black flex flex-col">
      {/* Barra de progresso */}
      <div className="absolute top-0 left-0 right-0 z-10 p-2 flex gap-1">
        {stories.map((_, index) => (
          <div key={index} className="h-1 bg-gray-600 flex-1 rounded-full overflow-hidden">
            <div 
              className={`h-full bg-white transition-all duration-100 ease-linear ${index < currentStoryIndex ? 'w-full' : index === currentStoryIndex ? '' : 'w-0'}`}
              style={{ width: index === currentStoryIndex ? `${progress}%` : index < currentStoryIndex ? '100%' : '0%' }}
            ></div>
          </div>
        ))}
      </div>

      {/* Cabeçalho - informações do usuário */}
      <div className="absolute top-4 left-0 right-0 z-10 px-4 pt-4">
        <div className="flex items-center">
          <Avatar className="h-10 w-10 mr-3 border border-white">
            <AvatarImage 
              src={currentStory.user?.avatar_url || undefined} 
              alt={currentStory.user?.username || "Usuário"} 
            />
            <AvatarFallback>
              {currentStory.user?.username?.charAt(0).toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <p className="text-white font-medium">
              {currentStory.user?.username || "Usuário"}
            </p>
            <p className="text-gray-300 text-xs">
              {new Date(currentStory.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
            </p>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-white" 
            onClick={() => navigate(-1)}
          >
            <X className="h-6 w-6" />
          </Button>
        </div>
      </div>

      {/* Conteúdo da história */}
      <div className="flex-1 flex items-center justify-center">
        {currentStory.media_type === 'video' ? (
          <video
            ref={videoRef}
            src={currentStory.media_url}
            className="max-h-screen max-w-full object-contain"
            autoPlay
            playsInline
            onTimeUpdate={handleVideoProgress}
            onEnded={handleVideoEnded}
            controls={false}
          />
        ) : (
          <img
            src={currentStory.media_url}
            alt="Story"
            className="max-h-screen max-w-full object-contain"
          />
        )}
      </div>

      {/* Botões de navegação */}
      <div className="absolute inset-0 flex">
        <div 
          className="w-1/2 h-full" 
          onClick={goToPrevStory}
        />
        <div 
          className="w-1/2 h-full" 
          onClick={goToNextStory}
        />
      </div>

      {/* Botões de navegação visíveis para debugging */}
      <div className="absolute bottom-4 left-0 right-0 flex justify-between px-4 opacity-0 hover:opacity-100 transition-opacity">
        <Button 
          variant="ghost" 
          size="icon" 
          className="text-white" 
          onClick={goToPrevStory}
          disabled={currentStoryIndex === 0}
        >
          <ChevronLeft className="h-8 w-8" />
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          className="text-white" 
          onClick={goToNextStory}
        >
          <ChevronRight className="h-8 w-8" />
        </Button>
      </div>

      {/* Botão de excluir para o proprietário */}
      {isOwner && (
        <div className="absolute bottom-20 right-4">
          <Button 
            variant="destructive" 
            size="icon" 
            onClick={handleDeleteStory}
          >
            <Trash2 className="h-5 w-5" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default StoryViewer;
