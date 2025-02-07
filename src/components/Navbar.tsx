import { Share2, Facebook, Instagram } from "lucide-react";
import { Button } from "@/components/ui/button";

const Navbar = () => {
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

  return (
    <nav className="bg-gradient-to-r from-primary to-primary-dark border-b border-primary/20 shadow-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo com hover effect */}
          <a 
            href="/" 
            className="flex items-center space-x-2 transform transition duration-300 hover:scale-105"
          >
            <span className="text-2xl font-bold text-white tracking-tighter bg-accent/20 px-4 py-1 rounded-lg">
              VALEOFC
            </span>
          </a>

          {/* Ícones de redes sociais e compartilhamento */}
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleShare}
              className="text-white/90 hover:text-white hover:bg-accent/20 rounded-full p-2 transition-all duration-300 ease-out hover:scale-110"
              aria-label="Compartilhar"
            >
              <Share2 className="h-6 w-6" strokeWidth={2.5} />
            </Button>

            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/90 hover:text-white p-2 rounded-full hover:bg-accent/20 transition-all duration-300 ease-out hover:scale-110"
              aria-label="Facebook"
            >
              <Facebook className="h-6 w-6" strokeWidth={2.5} />
            </a>

            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/90 hover:text-white p-2 rounded-full hover:bg-accent/20 transition-all duration-300 ease-out hover:scale-110"
              aria-label="Instagram"
            >
              <Instagram className="h-6 w-6" strokeWidth={2.5} />
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
