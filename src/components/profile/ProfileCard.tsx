
import { useTheme } from "@/components/ThemeProvider";
import type { Profile } from "@/types/profile";

interface ProfileCardProps {
  profile: Profile | null;
}

export function ProfileCard({ profile }: ProfileCardProps) {
  const { theme } = useTheme();

  return (
    <div className="pt-16 pb-20">
      <div className="relative">
        <div className="h-32 bg-gray-200 dark:bg-gray-800 relative">
          {profile?.cover_url ? (
            <img
              src={profile.cover_url}
              alt="Capa"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className={`w-full h-full flex items-center justify-center ${theme === 'light' ? 'bg-white' : 'bg-black'}`}>
              <p className="text-gray-500">Sem Capa de Perfil</p>
            </div>
          )}
        </div>

        <div className="relative -mt-16 px-4">
          <div className="relative inline-block">
            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white dark:border-black">
              {profile?.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className={`w-full h-full flex items-center justify-center ${theme === 'light' ? 'bg-white' : 'bg-black'}`}>
                  <p className="text-gray-500">Sem foto de perfil</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="px-4 mt-4">
          <div>
            <h2 className="text-2xl font-bold">{profile?.full_name}</h2>
            <p className="text-gray-400">@{profile?.username}</p>
          </div>
          {profile?.bio && (
            <p className={`mb-4 ${theme === 'light' ? 'text-black' : 'text-gray-300'}`}>
              {profile.bio}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
