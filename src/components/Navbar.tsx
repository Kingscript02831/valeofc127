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
    <nav className="bg-gradient-to-r from-blue-600 to-blue-800 py-4 px-6 shadow-lg">
      <div className="container mx-auto flex flex-col md:flex-row items-center justify-between">
        {/* Logotipo */}
        <a
          href="/"
          className="text-2xl font-extrabold text-white tracking-wide mb-4 md:mb-0"
        >
          VALEOFC
        </a>

        {/* Ícones */}
        <div className="flex items-center gap-6">
          {/* Facebook */}
          <a
            href="https://facebook.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white hover:text-blue-300 transition-transform transform hover:scale-110"
          >
            <Facebook className="h-6 w-6" />
          </a>

          {/* Instagram */}
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white hover:text-pink-300 transition-transform transform hover:scale-110"
          >
            <Instagram className="h-6 w-6" />
          </a>

          {/* Botão de Compartilhar */}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleShare}
            className="text-white hover:text-green-300 transition-transform transform hover:scale-110"
          >
            <Share2 className="h-6 w-6" />
          </Button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
