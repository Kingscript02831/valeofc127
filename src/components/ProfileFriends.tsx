
import type { Profile } from "@/types/profile";

interface ProfileFriendsProps {
  profile: Profile | null;
}

const ProfileFriends = ({ profile }: ProfileFriendsProps) => {
  return (
    <div className="grid grid-cols-3 gap-4">
      <div className="text-center">
        <p className="text-gray-500">Ainda não há amigos</p>
      </div>
    </div>
  );
};

export default ProfileFriends;
