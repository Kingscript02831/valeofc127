
import { Home, Search, ShoppingBag, PlusSquare, User } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const isActive = (path: string) => {
    if (path === "/" && location.pathname === "/") {
      return true;
    }
    if (path !== "/" && location.pathname.startsWith(path)) {
      return true;
    }
    return false;
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 h-16 border-t border-border bg-background/80 backdrop-blur-md z-50">
      <div className="grid grid-cols-5 h-full">
        <button
          className="flex flex-col items-center justify-center"
          onClick={() => navigate("/")}
        >
          <Home className={cn("h-5 w-5", isActive("/") ? "text-primary" : "text-muted-foreground")} />
          <span className={cn("text-xs mt-0.5", isActive("/") ? "text-primary font-medium" : "text-muted-foreground")}>
            Home
          </span>
        </button>
        
        <button
          className="flex flex-col items-center justify-center"
          onClick={() => navigate("/search")}
        >
          <Search className={cn("h-5 w-5", isActive("/search") ? "text-primary" : "text-muted-foreground")} />
          <span className={cn("text-xs mt-0.5", isActive("/search") ? "text-primary font-medium" : "text-muted-foreground")}>
            Buscar
          </span>
        </button>
        
        <button
          className="flex flex-col items-center justify-center"
          onClick={() => navigate("/posts/new")}
        >
          <PlusSquare className={cn("h-5 w-5", isActive("/posts/new") ? "text-primary" : "text-muted-foreground")} />
          <span className={cn("text-xs mt-0.5", isActive("/posts/new") ? "text-primary font-medium" : "text-muted-foreground")}>
            Publicar
          </span>
        </button>
        
        <button
          className="flex flex-col items-center justify-center"
          onClick={() => navigate("/products")}
        >
          <ShoppingBag className={cn("h-5 w-5", isActive("/products") ? "text-primary" : "text-muted-foreground")} />
          <span className={cn("text-xs mt-0.5", isActive("/products") ? "text-primary font-medium" : "text-muted-foreground")}>
            Market
          </span>
        </button>
        
        <button
          className="flex flex-col items-center justify-center"
          onClick={() => navigate("/perfil")}
        >
          <User className={cn("h-5 w-5", isActive("/perfil") ? "text-primary" : "text-muted-foreground")} />
          <span className={cn("text-xs mt-0.5", isActive("/perfil") ? "text-primary font-medium" : "text-muted-foreground")}>
            Perfil
          </span>
        </button>
      </div>
    </div>
  );
};

export default BottomNav;
