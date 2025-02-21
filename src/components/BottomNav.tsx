import { useLocation, useNavigate } from "react-router-dom";
import { Home, Search, PlusSquare, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/components/ThemeProvider";

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme } = useTheme();

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { icon: Home, label: "Início", path: "/" },
    { icon: Search, label: "Buscar", path: "/buscar" },
    { icon: PlusSquare, label: "Criar", path: "/criar" },
    { icon: User, label: "Perfil", path: "/perfil" },
  ];

  return (
    <nav className={`fixed bottom-0 left-0 right-0 z-50 ${theme === 'light' ? 'bg-white/90 border-t border-gray-200' : 'bg-black/90 border-t border-gray-800'} backdrop-blur`}>
      <div className="flex justify-around items-center h-16">
        {navItems.map(({ icon: Icon, label, path }) => (
          <button
            key={path}
            onClick={() => navigate(path)}
            className={cn(
              "flex flex-col items-center justify-center w-full h-full",
              isActive(path) ? "text-primary" : "text-muted-foreground"
            )}
          >
            <Icon className="h-6 w-6" />
            <span className="text-xs mt-1">{label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}
