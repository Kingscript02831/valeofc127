
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { useSiteConfig } from "@/hooks/useSiteConfig";

const Navbar4 = ({ user }: { user?: { name?: string; avatar_url?: string; username?: string } }) => {
  const navigate = useNavigate();
  const { data: config } = useSiteConfig();

  return (
    <nav 
      className="w-full fixed top-0 z-50 shadow-md"
      style={{ 
        background: `linear-gradient(to right, ${config?.navbar_color}, ${config?.primary_color})`,
        borderColor: `${config?.primary_color}20`
      }}
    >
      <div className="max-w-screen-2xl mx-auto px-4">
        <div className="flex items-center h-16">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="mr-2"
          >
            <ArrowLeft className="h-5 w-5" style={{ color: config?.text_color }} />
          </Button>

          {user && (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center overflow-hidden">
                {user.avatar_url ? (
                  <img
                    src={user.avatar_url}
                    alt={user.name || "Avatar"}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-lg text-white">
                    {user.name?.[0] || user.username?.[0] || "?"}
                  </span>
                )}
              </div>
              <span 
                className="font-semibold"
                style={{ color: config?.text_color }}
              >
                {user.name || user.username || "Usuário"}
              </span>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar4;
