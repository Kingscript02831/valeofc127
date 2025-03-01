
export const emojis = [
  {
    name: "amei1",
    label: "Amei",
  },
  {
    name: "curtidas1",
    label: "Curti",
  },
  {
    name: "haha1", 
    label: "Haha",
  },
  {
    name: "uau1",
    label: "Uau",
  },
  {
    name: "triste1",
    label: "Triste",
  },
  {
    name: "ggr1",
    label: "Grr",
  }
];

export const getReactionIcon = (reactionType: string) => {
  return `/public/${reactionType}.png`;
};
