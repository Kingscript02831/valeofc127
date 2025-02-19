
import type { Profile } from "@/types/profile";

interface ProfileInfoProps {
  profile: Profile | null;
  isOwnProfile: boolean;
}

const ProfileInfo = ({ profile }: ProfileInfoProps) => {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-2">Informações</h3>
        <div className="space-y-2">
          {profile?.email && (
            <p className="text-sm">
              <span className="font-medium">Email:</span> {profile.email}
            </p>
          )}
          {profile?.phone && (
            <p className="text-sm">
              <span className="font-medium">Telefone:</span> {profile.phone}
            </p>
          )}
          {profile?.website && (
            <p className="text-sm">
              <span className="font-medium">Website:</span> {profile.website}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileInfo;
