
import { useTheme } from "../../ThemeProvider";
import { useSiteConfig } from "../../hooks/useSiteConfig";

interface MenuFooterProps {
  onShare: () => void;
  onLogout: () => void;
}

export const MenuFooter = ({ onShare, onLogout }: MenuFooterProps) => {
  const { data: config } = useSiteConfig();
  const { theme, setTheme } = useTheme();

  return (
    <div className="mt-auto border-t border-border pt-4 space-y-3">
      <a
        href={config?.navbar_social_facebook}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center p-3 hover:bg-accent/10 rounded-lg transition-colors duration-200"
      >
        <img src="/facebook.png" alt="Facebook" className="w-5 h-5 mr-3" />
        <span className="text-sm text-foreground">Facebook</span>
      </a>

      {config?.navbar_social_instagram && (
        <a
          href={config.navbar_social_instagram}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center p-3 hover:bg-accent/10 rounded-lg transition-colors duration-200"
        >
          <img src="/instagram.png" alt="Instagram" className="w-5 h-5 mr-3" />
          <span className="text-sm text-foreground">Instagram</span>
        </a>
      )}

      <button
        onClick={() => setTheme(theme === "light" ? "dark" : "light")}
        className="w-full flex items-center p-3 hover:bg-accent/10 rounded-lg transition-colors duration-200"
      >
        <img 
          src={theme === "light" ? "/modoescuro.png" : "/sun.png"} 
          alt="Alterar tema" 
          className="w-5 h-5 mr-3" 
        />
        <span className="text-sm text-foreground">
          {theme === "light" ? "Modo escuro" : "Modo claro"}
        </span>
      </button>

      <button
        onClick={onShare}
        className="w-full flex items-center p-3 hover:bg-accent/10 rounded-lg transition-colors duration-200"
      >
        <img src="/compartilhar.png" alt="Compartilhar" className="w-5 h-5 mr-3" />
        <span className="text-sm text-foreground">Compartilhar</span>
      </button>

      <button
        onClick={onLogout}
        className="w-full flex items-center p-3 hover:bg-destructive/10 hover:text-destructive rounded-lg transition-colors duration-200"
      >
        <img src="/sair.png" alt="Sair" className="w-5 h-5 mr-3" />
        <span className="text-sm">Sair</span>
      </button>
    </div>
  );
};
