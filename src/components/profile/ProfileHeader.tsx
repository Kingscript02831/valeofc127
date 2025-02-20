
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import type { Profile } from "@/types/profile";

interface ProfileHeaderProps {
  profile: Profile | null;
}

export function ProfileHeader({ profile }: ProfileHeaderProps) {
  const navigate = useNavigate();

  return (
    <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between p-4">
      <div className="flex items-center">
        <button onClick={() => navigate(-1)} className="mr-2">
          <ArrowLeft className="h-6 w-6" />
        </button>
        <h1 className="text-lg font-semibold">{profile?.full_name}</h1>
      </div>
      <Button 
        variant="ghost" 
        onClick={() => navigate("/login")} 
        className="flex items-center"
      >
        Sair
      </Button>
    </div>
  );
}
