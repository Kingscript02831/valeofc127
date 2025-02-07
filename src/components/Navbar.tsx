
import { Share2, Facebook, Instagram, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type SiteConfig = Database['public']['Tables']['site_configuration']['Row'];

const Navbar = () => {
  const [config, setConfig] = useState<SiteConfig | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    fetchConfiguration();
  }, []);

  const fetchConfiguration = async () => {
    const { data } = await supabase
      .from("site_configuration")
      .select("*")
      .single();

    if (data) {
      setConfig(data);
    }
  };

  const handleShare = async () => {
    try {
      await navigator.share({
        title: "Vale Notícias",
        url: window.location.href,
      });
    } catch (err) {
      console.error("Error sharing:", err);
    }
  };

  if (!config) return null;

  return (
    <nav 
      className="bg-gradient-to-r border-b shadow-xl sticky top-0 z-50"
      style={{ 
        background: `linear-gradient(to right, ${config.navbar_color}, ${config.primary_color})`,
        borderColor: `${config.primary_color}20`
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo Section */}
          <div className="flex items-center">
            <a 
              href="/" 
              className="flex items-center space-x-2 transform transition duration-300 hover:scale-105"
            >
              {config.navbar_logo_type === 'image' && config.navbar_logo_image ? (
                <img 
                  src={config.navbar_logo_image} 
                  alt="Logo" 
                  className="h-8"
                />
              ) : (
                <span 
                  className="text-2xl font-bold tracking-tighter px-4 py-1 rounded-lg"
                  style={{ 
                    color: config.text_color,
                    backgroundColor: `${config.primary_color}20`
                  }}
                >
                  {config.navbar_logo_text || 'VALEOFC'}
                </span>
              )}
            </a>

            {/* Navigation Menu - Desktop */}
            <div className="hidden md:ml-6 md:flex">
              <NavigationMenu>
                <NavigationMenuList>
                  {config.navigation_links?.map((link: any) => (
                    <NavigationMenuItem key={link.url}>
                      <NavigationMenuLink
                        href={link.url}
                        className="px-3 py-2 rounded-md text-sm font-medium transition-colors hover:bg-primary/20"
                        style={{ color: config.text_color }}
                      >
                        {link.label}
                      </NavigationMenuLink>
                    </NavigationMenuItem>
                  ))}
                </NavigationMenuList>
              </NavigationMenu>
            </div>
          </div>

          {/* Right Side Items */}
          <div className="flex items-center space-x-3">
            {/* Social Media Links */}
            <div className="hidden sm:flex items-center space-x-3">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="transition-all duration-300 ease-out hover:scale-110 p-2 rounded-full hover:bg-primary/20"
                style={{ color: `${config.text_color}90` }}
                aria-label="Facebook"
              >
                <Facebook className="h-5 w-5" strokeWidth={2.5} />
              </a>

              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="transition-all duration-300 ease-out hover:scale-110 p-2 rounded-full hover:bg-primary/20"
                style={{ color: `${config.text_color}90` }}
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" strokeWidth={2.5} />
              </a>
            </div>

            {/* Share Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={handleShare}
              className="transition-all duration-300 ease-out hover:scale-110 rounded-full p-2 hover:bg-primary/20"
              style={{ color: `${config.text_color}90` }}
              aria-label="Compartilhar"
            >
              <Share2 className="h-5 w-5" strokeWidth={2.5} />
            </Button>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden transition-all duration-300 ease-out hover:scale-110 rounded-full p-2 hover:bg-primary/20"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              style={{ color: `${config.text_color}90` }}
              aria-label="Menu"
            >
              <Menu className="h-5 w-5" strokeWidth={2.5} />
            </Button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-2 space-y-1">
            {config.navigation_links?.map((link: any) => (
              <a
                key={link.url}
                href={link.url}
                className="block px-3 py-2 rounded-md text-base font-medium transition-colors hover:bg-primary/20"
                style={{ color: config.text_color }}
              >
                {link.label}
              </a>
            ))}
            {/* Mobile Social Media Links */}
            <div className="sm:hidden flex items-center space-x-3 px-3 py-2">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="transition-all duration-300 ease-out hover:scale-110 p-2 rounded-full hover:bg-primary/20"
                style={{ color: `${config.text_color}90` }}
                aria-label="Facebook"
              >
                <Facebook className="h-5 w-5" strokeWidth={2.5} />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="transition-all duration-300 ease-out hover:scale-110 p-2 rounded-full hover:bg-primary/20"
                style={{ color: `${config.text_color}90` }}
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" strokeWidth={2.5} />
              </a>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
