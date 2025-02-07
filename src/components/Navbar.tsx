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
    <nav className="bg-primary py-4 px-6 shadow-lg">
      <div className="container mx-auto flex justify-between items-center">
        <a href="/" className="text-2xl font-bold text-white">
          VALEOFC
        </a>
        
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleShare}
            className="text-white hover:text-accent"
          >
            <Share2 className="h-5 w-5" />
          </Button>
          
          <a
            href="https://facebook.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white hover:text-accent"
          >
            <Facebook className="h-5 w-5" />
          </a>
          
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white hover:text-accent"
          >
            <Instagram className="h-5 w-5" />
          </a>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;