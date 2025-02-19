
import { Button } from "./ui/button";
import { Camera } from "lucide-react";
import { useTheme } from "./ThemeProvider";
import type { Profile } from "@/types/profile";

interface ProfileHeaderProps {
  profile: Profile | null;
  isOwnProfile: boolean;
}

const ProfileHeader = ({ profile, isOwnProfile }: ProfileHeaderProps) => {
  const { theme } = useTheme();

  return (
    <div className={`relative px-4 pb-4 -mt-12 ${theme === 'light' ? 'text-black' : 'text-white'}`}>
      <div className="flex items-end justify-between">
        <div className="relative">
          <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-background">
            <img
              src={profile?.avatar_url || "/placeholder.svg"}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          </div>
          {isOwnProfile && (
            <label
              className="absolute bottom-0 right-0 p-1 rounded-full bg-black/50 cursor-pointer hover:bg-black/70"
            >
              <Camera className="h-4 w-4 text-[#1EAEDB]" />
              <input type="file" accept="image/*" className="hidden" />
            </label>
          )}
        </div>
        {isOwnProfile ? (
          <Button
            variant="outline"
            className="h-9"
          >
            Editar Perfil
          </Button>
        ) : (
          <Button
            variant="default"
            className="h-9"
          >
            Seguir
          </Button>
        )}
      </div>
      <div className="mt-3">
        <h2 className="text-xl font-semibold">{profile?.full_name || 'Nome não definido'}</h2>
        <p className="text-muted-foreground">@{profile?.username || 'username'}</p>
      </div>
      {profile?.bio && (
        <p className="mt-2">{profile.bio}</p>
      )}
      <div className="flex gap-4 mt-3">
        <button className="text-sm">
          <span className="font-semibold">0</span> seguidores
        </button>
        <button className="text-sm">
          <span className="font-semibold">0</span> seguindo
        </button>
      </div>
    </div>
  );
};

export default ProfileHeader;
