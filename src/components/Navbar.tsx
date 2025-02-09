
import { Share2, Facebook, Instagram } from "lucide-react";
import { Button } from "./ui/button";

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
    <nav className="w-full fixed top-0 z-50 h-16 bg-gray-800">
      <div className="max-w-screen-2xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <span className="text-white text-xl font-bold">Vale Notícias</span>
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleShare}
              className="text-white hover:bg-gray-700"
              aria-label="Compartilhar"
            >
              <Share2 className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
