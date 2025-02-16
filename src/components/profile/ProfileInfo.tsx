
import { Mail, Phone, Calendar, Globe, Building, Home, MapPin } from "lucide-react";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import type { Profile } from "../../types/profile";

interface ProfileInfoProps {
  profile: Profile | null;
}

export const ProfileInfo = ({ profile }: ProfileInfoProps) => {
  return (
    <div className="grid gap-4">
      <Card className="border-none bg-gray-900 shadow-xl">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg text-white">
            Informações Pessoais
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {profile?.email && (
            <div className="flex items-center gap-3 text-gray-300">
              <Mail className="h-4 w-4" />
              <span>{profile.email}</span>
            </div>
          )}
          {profile?.phone && (
            <div className="flex items-center gap-3 text-gray-300">
              <Phone className="h-4 w-4" />
              <span>{profile.phone}</span>
            </div>
          )}
          {profile?.birth_date && (
            <div className="flex items-center gap-3 text-gray-300">
              <Calendar className="h-4 w-4" />
              <span>{format(new Date(profile.birth_date), "dd/MM/yyyy")}</span>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-none bg-gray-900 shadow-xl">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg text-white">
            Endereço
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {profile?.street && (
            <div className="flex items-center gap-3 text-gray-300">
              <Home className="h-4 w-4" />
              <span>{profile.street}</span>
            </div>
          )}
          {profile?.house_number && (
            <div className="flex items-center gap-3 text-gray-300">
              <MapPin className="h-4 w-4" />
              <span>{profile.house_number}</span>
            </div>
          )}
          {profile?.city && (
            <div className="flex items-center gap-3 text-gray-300">
              <Building className="h-4 w-4" />
              <span>{profile.city}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {profile?.website && (
        <Card className="border-none bg-gray-900 shadow-xl">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 text-gray-300">
              <Globe className="h-4 w-4" />
              <a
                href={profile.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:underline"
              >
                {profile.website}
              </a>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
