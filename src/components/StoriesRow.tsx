
import React, { useState, useEffect } from 'react';
import { ScrollArea, ScrollBar } from "./ui/scroll-area";
import StoryCircle from "./StoryCircle";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import PhotoUrlDialog from "./PhotoUrlDialog";
import { PlusCircle, Image, Video } from "lucide-react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import StoryViewer from './StoryViewer';

interface Story {
  id: string;
  user_id: string;
  content?: string;
  media_url?: string;
  media_type: 'image' | 'video';
  created_at: string;
  expires_at: string;
  username: string;
  avatar_url: string;
  isOwn?: boolean;
  isNew?: boolean;
}

const StoriesRow: React.FC = () => {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewedStories, setViewedStories] = useState<Record<string, boolean>>({});
  const [isPhotoUrlDialogOpen, setIsPhotoUrlDialogOpen] = useState(false);
  const [mediaType, setMediaType] = useState<'image' | 'video'>('image');
  const [currentStory, setCurrentStory] = useState<{
    open: boolean;
    username: string;
    imageUrl: string;
    id: string;
  }>({
    open: false,
    username: "",
    imageUrl: "",
    id: ""
  });
  
  useEffect(() => {
    fetchStories();
  }, []);

  const fetchStories = async () => {
    try {
      setLoading(true);
      
      // Primeiro, verificamos se o usuário está logado
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        // Se não estiver logado, carregamos apenas stories de exemplo
        setStories([
          { id: "own", user_id: "own", media_type: 'image', username: "Seu story", avatar_url: "/placeholder.svg", isOwn: true, isNew: false, created_at: new Date().toISOString(), expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() }
        ]);
        setLoading(false);
        return;
      }

      // Buscamos stories que não expiraram ainda (24 horas)
      const { data, error } = await supabase
        .from('stories')
        .select(`
          id, 
          user_id, 
          content, 
          media_url, 
          media_type, 
          created_at, 
          expires_at,
          profiles:user_id (username, avatar_url)
        `)
        .lt('expires_at', new Date(Date.now() + 1000).toISOString())
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar stories:', error);
        toast.error('Não foi possível carregar os stories');
      } else {
        // Formatamos os dados para o formato que precisamos
        const formattedStories = data.map(story => ({
          id: story.id,
          user_id: story.user_id,
          content: story.content,
          media_url: story.media_url,
          media_type: story.media_type,
          created_at: story.created_at,
          expires_at: story.expires_at,
          username: story.profiles?.username || 'Usuário',
          avatar_url: story.profiles?.avatar_url || '/placeholder.svg',
          isOwn: story.user_id === user.id,
          isNew: true // Consideramos todos como novos inicialmente
        }));

        // Adicionamos o story "próprio" no início
        const ownStory = {
          id: "own",
          user_id: user.id,
          media_type: 'image' as 'image' | 'video',
          username: "Seu story",
          avatar_url: user.user_metadata?.avatar_url || "/placeholder.svg",
          isOwn: true,
          isNew: false,
          created_at: new Date().toISOString(),
          expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
        };

        // Agrupamos stories do mesmo usuário
        const userStories: Record<string, Story[]> = {};
        formattedStories.forEach(story => {
          if (!userStories[story.user_id]) {
            userStories[story.user_id] = [];
          }
          userStories[story.user_id].push(story);
        });

        // Pegamos apenas o story mais recente de cada usuário
        const uniqueUserStories = Object.values(userStories).map(userStoryList => 
          userStoryList.sort((a, b) => 
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          )[0]
        );

        // Ordenamos por data de criação (mais recentes primeiro)
        const sortedStories = [ownStory, ...uniqueUserStories.filter(story => story.user_id !== user.id)];
        setStories(sortedStories);
      }

      setLoading(false);
    } catch (error) {
      console.error('Erro ao carregar stories:', error);
      setLoading(false);
      toast.error('Erro ao carregar stories');
    }
  };

  const handleStoryClick = (story: Story) => {
    if (story.id === "own") {
      // Se clicar no próprio story, não fazemos nada pois será gerenciado pelo dropdown
    } else {
      // Abrir o visualizador de story
      setCurrentStory({
        open: true,
        username: story.username,
        imageUrl: story.media_url || '',
        id: story.id
      });
      
      // Marcar como visualizado
      setViewedStories(prev => ({...prev, [story.id]: true}));
    }
  };
  
  const handleCloseStory = () => {
    setCurrentStory({...currentStory, open: false});
  };

  const handleAddStory = async (url: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error('Você precisa estar logado para adicionar um story');
        return;
      }

      // Data de expiração (24 horas a partir de agora)
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

      const { data, error } = await supabase
        .from('stories')
        .insert({
          user_id: user.id,
          media_url: url,
          media_type: mediaType,
          created_at: new Date().toISOString(),
          expires_at: expiresAt
        })
        .select();

      if (error) {
        console.error('Erro ao adicionar story:', error);
        toast.error('Não foi possível adicionar o story');
        return;
      }

      toast.success('Story adicionado com sucesso!');
      fetchStories(); // Recarregar os stories
    } catch (error) {
      console.error('Erro ao adicionar story:', error);
      toast.error('Ocorreu um erro ao adicionar o story');
    }
  };

  const handleAddFromPhotoUrl = (url: string) => {
    handleAddStory(url);
    setIsPhotoUrlDialogOpen(false);
  };

  const openPhotoUrlDialog = (type: 'image' | 'video') => {
    setMediaType(type);
    setIsPhotoUrlDialogOpen(true);
  };
  
  return (
    <div className="w-full py-2">
      <ScrollArea className="w-full whitespace-nowrap">
        <div className="flex space-x-4 px-4 py-2">
          {loading ? (
            // Shimmer loading effect
            Array(5).fill(0).map((_, i) => (
              <div key={i} className="flex flex-col items-center space-y-1 animate-pulse">
                <div className="h-16 w-16 rounded-full bg-gray-200"></div>
                <div className="h-3 w-16 rounded bg-gray-200"></div>
              </div>
            ))
          ) : (
            // Actual stories
            stories.map((story) => (
              <div key={story.id}>
                {story.isOwn ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <div>
                        <StoryCircle
                          imageUrl={story.avatar_url}
                          username={story.username}
                          isNew={story.isNew}
                          isOwn={story.isOwn}
                          isViewed={viewedStories[story.id]}
                        />
                      </div>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => openPhotoUrlDialog('image')}>
                        <Image className="mr-2 h-4 w-4" />
                        <span>Foto do Dropbox</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => openPhotoUrlDialog('video')}>
                        <Video className="mr-2 h-4 w-4" />
                        <span>Vídeo do Dropbox</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <div onClick={() => handleStoryClick(story)}>
                    <StoryCircle
                      imageUrl={story.avatar_url}
                      username={story.username}
                      isNew={story.isNew}
                      isOwn={story.isOwn}
                      isViewed={viewedStories[story.id]}
                    />
                  </div>
                )}
              </div>
            ))
          )}
        </div>
        <ScrollBar orientation="horizontal" className="hidden" />
      </ScrollArea>
      
      <PhotoUrlDialog
        isOpen={isPhotoUrlDialogOpen}
        onClose={() => setIsPhotoUrlDialogOpen(false)}
        onConfirm={handleAddFromPhotoUrl}
        title={mediaType === 'image' ? "Adicionar foto do Dropbox" : "Adicionar vídeo do Dropbox"}
      />

      <StoryViewer
        isOpen={currentStory.open}
        onClose={handleCloseStory}
        username={currentStory.username}
        imageUrl={currentStory.imageUrl}
        storyId={currentStory.id}
      />
    </div>
  );
};

export default StoriesRow;
