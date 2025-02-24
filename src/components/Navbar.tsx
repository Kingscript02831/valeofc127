import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useSiteConfig } from "@/hooks/useSiteConfig";
import { Plus, Search, Menu } from "lucide-react";
import MenuConfig from "./menuconfig";
import { SearchUsersDialog } from "./SearchUsersDialog";
import { useTheme } from "./ThemeProvider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

const Navbar = () => {
  const { data: config, isLoading, isError } = useSiteConfig();
  const navigate = useNavigate();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { theme } = useTheme();

  if (isLoading) {
    return (
      <nav className="w-full fixed top-0 z-50 h-16 animate-pulse bg-gray-200" />
    );
  }

  if (isError || !config) {
    return (
      <nav className="w-full fixed top-0 z-50 h-16 bg-gray-800">
        <div className="max-w-screen-2xl mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <span className="text-white">Error loading navbar</span>
          </div>
        </div>
      </nav>
    );
  }

  const getNavbarStyle = () => {
    if (theme === 'dark') {
      return {
        background: '#1A1F2C',
        borderColor: '#333333'
      };
    }
    return {
      background: `linear-gradient(to right, ${config.navbar_color}, ${config.primary_color})`,
      borderColor: `${config.primary_color}20`
    };
  };

  const getButtonStyle = () => {
    if (theme === 'dark') {
      return {
        color: '#ffffff',
        background: '#333333'
      };
    }
    return {
      color: config.text_color,
      background: '#f3f3f3'
    };
  };

  return (
    <>
      <nav 
        className="w-full fixed top-0 z-50 shadow-md"
        style={getNavbarStyle()}
      >
        <div className="max-w-screen-2xl mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <Link 
              to="/" 
              className="flex items-center space-x-2 transform transition duration-300 hover:scale-105"
            >
              {config.navbar_logo_type === 'image' && config.navbar_logo_image ? (
                <img 
                  src={config.navbar_logo_image} 
                  alt="Logo" 
                  className="h-12 w-12 rounded-full object-cover border-2 transition-transform duration-300 hover:scale-110"
                  style={{ 
                    borderColor: theme === 'dark' ? '#ffffff' : config.text_color,
                  }}
                />
              ) : (
                <span 
                  className="text-3xl font-bold tracking-tighter"
                  style={{ color: theme === 'dark' ? '#ffffff' : config.navbar_title_color || config.text_color }}
                >
                  {config.navbar_logo_text || 'Vale Notícias'}
                </span>
              )}
            </Link>

            <div className="flex items-center space-x-3">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className="flex items-center justify-center w-11 h-11 rounded-full transition-all duration-300 hover:scale-105"
                    style={getButtonStyle()}
                  >
                    <Plus className="h-6 w-6" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => navigate('/posts/new')}>
                    <img src="/posts.png" alt="Posts" className="w-4 h-4 mr-2" />
                    Criar Post
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/products/new')}>
                    <img src="/produtos.png" alt="Produtos" className="w-4 h-4 mr-2" />
                    Criar Produto
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <button
                onClick={() => setIsSearchOpen(true)}
                className="flex items-center justify-center w-11 h-11 rounded-full transition-all duration-300 hover:scale-105"
                style={getButtonStyle()}
              >
                <Search className="h-6 w-6" />
              </button>

              <MenuConfig />
            </div>
          </div>
        </div>
      </nav>

      <SearchUsersDialog 
        open={isSearchOpen} 
        onOpenChange={setIsSearchOpen} 
      />
    </>
  );
};

export default Navbar;
