
import React from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

interface ReactionMenuProps {
  postId: string;
  onClose: () => void;
  onReact: (reaction: string) => void;
}

const reactions = [
  { emoji: "👍", name: "like" },
  { emoji: "❤️", name: "love" },
  { emoji: "😂", name: "haha" },
  { emoji: "😮", name: "wow" },
  { emoji: "😢", name: "sad" },
  { emoji: "😡", name: "angry" },
];

const ReactionMenu: React.FC<ReactionMenuProps> = ({ postId, onClose, onReact }) => {
  const queryClient = useQueryClient();

  const handleReaction = async (reactionType: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Check if user already reacted
      const { data: existingReaction } = await supabase
        .from("post_reactions")
        .select("*")
        .eq("post_id", postId)
        .eq("user_id", user.id)
        .single();

      if (existingReaction) {
        // Update existing reaction
        if (existingReaction.reaction_type === reactionType) {
          // Remove reaction if clicking the same one
          await supabase
            .from("post_reactions")
            .delete()
            .eq("id", existingReaction.id);
        } else {
          // Change reaction type
          await supabase
            .from("post_reactions")
            .update({ reaction_type: reactionType })
            .eq("id", existingReaction.id);
        }
      } else {
        // Add new reaction
        await supabase.from("post_reactions").insert({
          post_id: postId,
          user_id: user.id,
          reaction_type: reactionType,
        });
      }

      // Update the post in the cache
      queryClient.invalidateQueries({ queryKey: ["post", postId] });
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      
      onReact(reactionType);
      onClose();
    } catch (error) {
      console.error("Error handling reaction:", error);
    }
  };

  return (
    <div className="absolute z-50 bg-card shadow-lg rounded-full p-2 flex">
      {reactions.map((reaction) => (
        <Button
          key={reaction.name}
          variant="ghost"
          size="sm"
          className="h-10 w-10 rounded-full hover:bg-muted"
          onClick={() => handleReaction(reaction.name)}
        >
          <span className="text-xl">{reaction.emoji}</span>
        </Button>
      ))}
    </div>
  );
};

export default ReactionMenu;
