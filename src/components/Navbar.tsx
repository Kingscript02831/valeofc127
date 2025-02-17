import { Share2, Facebook, Instagram, User, Menu } from "lucide-react";
import { Button } from "../components/ui/button";
import { useSiteConfig } from "../hooks/useSiteConfig";
import { ThemeToggle } from "./ThemeToggle";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";

const Navbar = () => {
  // ... (mantido o mesmo código anterior)

  return (
    <nav className="w-full fixed top-0 z-50 shadow-md fade-in"
         style={{ 
           background: `linear-gradient(to right, ${config?.navbar_color}, ${config?.primary_color})`,
           borderColor: `${config?.primary_color}20`
         }}>
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex overflow-x-auto scrollbar-hide justify-between items-center h-16 gap-x-4">
          {/* ... (mantido o mesmo código anterior) */}

          <div className="flex items-center space-x-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="transition-all duration-300 ease-out hover:scale-110 rounded-full p-3 hover:bg-primary/20"
                  style={{ color: config.text_color }}
                  aria-label="Menu"
                >
                  <Menu className="h-8 w-8" strokeWidth={2.5} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="min-w-[200px] shadow-lg rounded-lg border-none"
                align="end"
                style={{
                  background: `linear-gradient(to right, ${config.navbar_color}, ${config.primary_color})`,
                  color: config.text_color,
                }}
              >
                <DropdownMenuItem
                  onClick={handleShare}
                  className="flex items-center space-x-2 p-2 cursor-pointer hover:bg-white/10 rounded-md"
                >
                  <Share2 className="h-5 w-5" strokeWidth={2} />
                  <span>Compartilhar</span>
                </DropdownMenuItem>

                {/* ... (mantidos os mesmos itens do menu anteriores) */}

                <DropdownMenuItem
                  className="flex items-center space-x-2 p-2 cursor-pointer hover:bg-white/10 rounded-md"
                >
                  <ThemeToggle 
                    variant="dropdown" 
                    textColor={config.text_color}
                  />
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
