
import React from "react";
import { useSiteConfig } from "@/hooks/useSiteConfig";
import { Button } from "./ui/button";
import PhotoUrlDialog from "./PhotoUrlDialog";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface EmojiConfig {
  like_emoji?: string;
  love_emoji?: string;
  haha_emoji?: string;
  sad_emoji?: string;
  angry_emoji?: string;
}

const EmijiPosts = () => {
  const { data: config } = useSiteConfig();
  const [isOpen, setIsOpen] = React.useState(false);
  const [currentEmoji, setCurrentEmoji] = React.useState<keyof EmojiConfig | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleOpenDialog = (emojiType: keyof EmojiConfig) => {
    setCurrentEmoji(emojiType);
    setIsOpen(true);
  };

  const handleSaveEmojiUrl = async (url: string) => {
    try {
      if (!currentEmoji) return;

      const updates = {
        [currentEmoji]: url,
      };

      const { error } = await supabase
        .from('site_configuration')
        .update(updates)
        .eq('id', config?.id);

      if (error) throw error;

      await queryClient.invalidateQueries({ queryKey: ['site-configuration'] });

      toast({
        title: "Sucesso",
        description: "Emoji atualizado com sucesso",
      });
    } catch (error) {
      console.error('Error updating emoji:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o emoji",
        variant: "destructive",
      });
    }
  };

  const emojiButtons = [
    { type: 'like_emoji' as const, label: 'Like' },
    { type: 'love_emoji' as const, label: 'Love' },
    { type: 'haha_emoji' as const, label: 'Haha' },
    { type: 'sad_emoji' as const, label: 'Sad' },
    { type: 'angry_emoji' as const, label: 'Angry' },
  ];

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-semibold mb-4">Personalizar Emojis</h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {emojiButtons.map(({ type, label }) => (
          <div key={type} className="flex flex-col items-center gap-2 p-4 border rounded-lg">
            <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
              {config?.[type] ? (
                <img
                  src={config[type]}
                  alt={`${label} emoji`}
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                  {label}
                </div>
              )}
            </div>
            <Button 
              onClick={() => handleOpenDialog(type)}
              variant="outline"
              className="w-full"
            >
              Alterar {label}
            </Button>
          </div>
        ))}
      </div>

      <PhotoUrlDialog
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onConfirm={handleSaveEmojiUrl}
        title={`Alterar emoji ${currentEmoji?.replace('_emoji', '') || ''}`}
      />
    </div>
  );
};

export default EmijiPosts;
