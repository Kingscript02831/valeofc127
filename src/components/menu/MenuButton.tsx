
import { useSiteConfig } from "../../hooks/useSiteConfig";

interface MenuButtonProps {
  onClick: () => void;
}

export const MenuButton = ({ onClick }: MenuButtonProps) => {
  const { data: config } = useSiteConfig();

  return (
    <button
      onClick={onClick}
      className="flex items-center justify-center p-2.5 rounded-xl transition-all duration-300 hover:scale-105 hover:bg-accent/10"
      style={{ 
        color: config?.text_color,
        background: config ? `${config.primary_color}10` : 'transparent',
      }}
    >
      <img src="/menu-bars.png" alt="Menu" className="h-5 w-5" />
    </button>
  );
};
