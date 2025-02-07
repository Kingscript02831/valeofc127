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
    <nav className="bg-gradient-to-r from-blue-600 to-purple-600 py-4 px-6 shadow-xl">
      <div className="container mx-auto flex justify-between items-center">
        <a href="/" className="text-3xl font-extrabold text-white hover:text-gray-300 transition duration-200 ease-in-out">
          VALEOFC
        </a>
        
        <div className="flex items-center gap-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleShare}
            className="text-white hover:text-accent hover:bg-gray-700 rounded-full p-2 transition duration-150 ease-in-out"
          >
            <Share2 className="h-6 w-6" />
          </Button>
          
          <a
            href="https://facebook.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white hover:text-blue-500 hover:bg-white hover:bg-opacity-20 p-2 rounded-full transition duration-150 ease-in-out"
          >
            <Facebook className="h-6 w-6" />
          </a>
          
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white hover:text-pink-500 hover:bg-white hover:bg-opacity-20 p-2 rounded-full transition duration-150 ease-in-out"
          >
            <Instagram className="h-6 w-6" />
          </a>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
