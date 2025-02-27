
import { useNavigate, useLocation } from "react-router-dom";
import {
  Home,
  CalendarDays,
  ShoppingBag,
  Map,
  User,
  MessageSquare
} from "lucide-react";

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const path = location.pathname;

  const isActive = (route: string) => {
    if (route === "/" && path === "/") return true;
    return route !== "/" && path.startsWith(route);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border h-16 z-50">
      <div className="grid grid-cols-6 h-full">
        <button
          onClick={() => navigate("/")}
          className={`flex flex-col items-center justify-center space-y-1 ${
            isActive("/") ? "text-primary" : "text-foreground/60"
          }`}
        >
          <Home className="h-5 w-5" />
          <span className="text-xs">Home</span>
        </button>

        <button
          onClick={() => navigate("/eventos")}
          className={`flex flex-col items-center justify-center space-y-1 ${
            isActive("/eventos") ? "text-primary" : "text-foreground/60"
          }`}
        >
          <CalendarDays className="h-5 w-5" />
          <span className="text-xs">Eventos</span>
        </button>

        <button
          onClick={() => navigate("/products")}
          className={`flex flex-col items-center justify-center space-y-1 ${
            isActive("/products") ? "text-primary" : "text-foreground/60"
          }`}
        >
          <ShoppingBag className="h-5 w-5" />
          <span className="text-xs">Produtos</span>
        </button>

        <button
          onClick={() => navigate("/lugares")}
          className={`flex flex-col items-center justify-center space-y-1 ${
            isActive("/lugares") ? "text-primary" : "text-foreground/60"
          }`}
        >
          <Map className="h-5 w-5" />
          <span className="text-xs">Lugares</span>
        </button>

        <button
          onClick={() => navigate("/chat")}
          className={`flex flex-col items-center justify-center space-y-1 ${
            isActive("/chat") ? "text-primary" : "text-foreground/60"
          }`}
        >
          <MessageSquare className="h-5 w-5" />
          <span className="text-xs">Chat</span>
        </button>

        <button
          onClick={() => navigate("/perfil")}
          className={`flex flex-col items-center justify-center space-y-1 ${
            isActive("/perfil") ? "text-primary" : "text-foreground/60"
          }`}
        >
          <User className="h-5 w-5" />
          <span className="text-xs">Perfil</span>
        </button>
      </div>
    </div>
  );
}
