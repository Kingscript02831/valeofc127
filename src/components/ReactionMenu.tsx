
import { Button } from "./ui/button";
import { reactionsList } from "../utils/emojisPosts";
import { supabase } from "../integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

export interface ReactionMenuProps {
  postId: string;
  onClose: () => void;
}

const ReactionMenu: React.FC<ReactionMenuProps> = ({ postId, onClose }) => {
  const queryClient = useQueryClient();

  const handleReaction = async (type: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Check if user already reacted
      const { data: existingReaction } = await supabase
        .from('post_likes')
        .select()
        .eq('post_id', postId)
        .eq('user_id', user.id)
        .single();

      if (existingReaction) {
        // Update existing reaction
        await supabase
          .from('post_likes')
          .update({ reaction_type: type })
          .eq('id', existingReaction.id);
      } else {
        // Create new reaction
        await supabase
          .from('post_likes')
          .insert({
            post_id: postId,
            user_id: user.id,
            reaction_type: type
          });
      }

      // Invalidate posts query to refresh the data
      await queryClient.invalidateQueries({ queryKey: ['posts'] });
      onClose();
    } catch (error) {
      console.error('Error adding reaction:', error);
    }
  };

  return (
    <div className="absolute bottom-full left-0 mb-2 p-2 bg-background rounded-lg shadow-lg border flex gap-1 z-50">
      {reactionsList.map((reaction) => (
        <Button
          key={reaction.type}
          variant="ghost"
          size="sm"
          className="hover:scale-125 transition-transform"
          onClick={() => handleReaction(reaction.type)}
        >
          <span role="img" aria-label={reaction.label}>
            {reaction.emoji}
          </span>
        </Button>
      ))}
    </div>
  );
};

export default ReactionMenu;
