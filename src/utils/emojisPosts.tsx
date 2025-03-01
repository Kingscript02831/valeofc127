
export const reactionsList = [
  {
    emoji: "/curtidas1.png",
    type: "like",
    label: "Curtir"
  },
  {
    emoji: "/amei1.png",
    type: "love",
    label: "Amei" 
  },
  {
    emoji: "/haha1.png",
    type: "haha",
    label: "Haha"
  },
  {
    emoji: "/uau1.png",
    type: "wow",
    label: "Uau"
  },
  {
    emoji: "/triste1.png",
    type: "sad",
    label: "Triste"
  }
];

export const getReactionIcon = (type: string) => {
  const reaction = reactionsList.find(r => r.type === type);
  return reaction ? reaction.emoji : "/curtidas1.png";
};
