
import type { Profile } from "@/types/profile";

interface ProfileGalleryProps {
  profile: Profile | null;
}

const ProfileGallery = ({ profile }: ProfileGalleryProps) => {
  return (
    <div className="grid grid-cols-3 gap-1">
      <div className="aspect-square bg-gray-800/50 flex items-center justify-center">
        <p className="text-gray-500">Ainda não há fotos</p>
      </div>
    </div>
  );
};

export default ProfileGallery;
