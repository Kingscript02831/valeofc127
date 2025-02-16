
import { AtSign } from "lucide-react";
import { ProfileAvatar } from "./ProfileAvatar";
import type { Profile } from "../../types/profile";

interface ProfileHeaderProps {
  profile: Profile | null;
}

export const ProfileHeader = ({ profile }: ProfileHeaderProps) => {
  return (
    <div className="flex items-center gap-6">
      <div className="relative group">
        <ProfileAvatar avatarUrl={profile?.avatar_url} />
      </div>
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold text-white">{profile?.full_name}</h2>
        {profile?.username && (
          <p className="text-gray-400 flex items-center gap-1 text-sm">
            <AtSign className="h-4 w-4" />
            {profile.username}
          </p>
        )}
        {profile?.bio && (
          <p className="text-sm text-gray-400">{profile.bio}</p>
        )}
      </div>
    </div>
  );
};
