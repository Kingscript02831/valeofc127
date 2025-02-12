
import { useNavigate } from "react-router-dom";
import { Home, MessageCircle, Bell, User } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function BottomNav() {
  const navigate = useNavigate();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-[#1A1F2C] to-[#9b87f5] py-2 border-t border-gray-700">
      <div className="container mx-auto px-4">
        <div className="flex justify-around items-center">
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:text-white/80"
            onClick={() => navigate("/")}
          >
            <Home className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:text-white/80"
            onClick={() => navigate("/conversations")}
          >
            <MessageCircle className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:text-white/80"
            onClick={() => navigate("/notify")}
          >
            <Bell className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:text-white/80"
            onClick={() => navigate("/perfil")}
          >
            <User className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </nav>
  );
}
