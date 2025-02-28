
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Camera,
  LogOut,
  Settings,
  Instagram,
  MapPin,
  Phone,
  Store,
  Edit
} from "lucide-react";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import BottomNav from "@/components/BottomNav";
import ProfileTabs from "@/components/ProfileTabs";
import EditProfileDialog from "@/components/EditProfileDialog";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { calculateDistance } from "@/utils/distance";

const Profile = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false);
  const [currentUserLocation, setCurrentUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  // Get user location for distance calculation
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          console.error("Error getting location:", error);
        }
      );
    }
  }, []);

  // Get current user
  const { data: session, isLoading: isSessionLoading } = useQuery({
    queryKey: ["session"],
    queryFn: async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error || !data.session) {
        navigate("/login");
        return null;
      }
      return data.session;
    },
  });

  // Get user profile
  const { data: profile, isLoading: isProfileLoading } = useQuery({
    queryKey: ["profile", session?.user.id],
    queryFn: async () => {
      if (!session?.user.id) return null;

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!session?.user.id,
  });

  // Get user products
  const { data: userProducts, isLoading: isProductsLoading } = useQuery({
    queryKey: ["userProducts", session?.user.id],
    queryFn: async () => {
      if (!session?.user.id) return [];

      try {
        const { data, error } = await supabase
          .from("products")
          .select("*")
          .eq("user_id", session.user.id)
          .order("created_at", { ascending: false });

        if (error) throw error;

        if (currentUserLocation) {
          return data.map((product) => {
            if (product.location_lat && product.location_lng) {
              const distance = calculateDistance(
                currentUserLocation.latitude,
                currentUserLocation.longitude,
                parseFloat(product.location_lat),
                parseFloat(product.location_lng)
              );
              return { ...product, distance };
            }
            return product;
          });
        }

        return data;
      } catch (error) {
        console.error("Error fetching user products:", error);
        return [];
      }
    },
    enabled: !!session?.user.id,
  });

  // Get user posts
  const { data: userPosts, isLoading: isPostsLoading } = useQuery({
    queryKey: ["userPosts", session?.user.id],
    queryFn: async () => {
      if (!session?.user.id) return [];

      try {
        const { data, error } = await supabase
          .from("posts")
          .select(`
            *,
            user:user_id (
              id,
              username,
              full_name,
              avatar_url
            ),
            post_likes (
              reaction_type,
              user_id
            ),
            post_comments (
              id
            )
          `)
          .eq("user_id", session.user.id)
          .order("created_at", { ascending: false });

        if (error) throw error;
        return data;
      } catch (error) {
        console.error("Error fetching user posts:", error);
        return [];
      }
    },
    enabled: !!session?.user.id,
  });

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      queryClient.clear();
      navigate("/login");
    } catch (error) {
      console.error("Error signing out:", error);
      toast.error("Erro ao sair da conta", {
        position: "top-center",
        style: { marginTop: "64px" },
      });
    }
  };

  const openInstagram = () => {
    if (profile?.instagram) {
      window.open(`https://instagram.com/${profile.instagram}`, "_blank");
    }
  };

  const openWhatsApp = () => {
    if (profile?.whatsapp) {
      const formattedPhone = profile.whatsapp.replace(/\D/g, "");
      window.open(`https://wa.me/${formattedPhone}`, "_blank");
    }
  };

  if (isSessionLoading || isProfileLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto pt-20 pb-24 px-4">
          <div className="animate-pulse">
            <div className="flex items-center justify-center h-32 mb-4">
              <div className="w-32 h-32 rounded-full bg-gray-300"></div>
            </div>
            <div className="h-6 bg-gray-300 rounded w-1/2 mx-auto mb-2"></div>
            <div className="h-4 bg-gray-300 rounded w-1/3 mx-auto mb-8"></div>
            <div className="h-10 bg-gray-300 rounded mb-6"></div>
            <div className="h-24 bg-gray-300 rounded mb-6"></div>
            <div className="h-40 bg-gray-300 rounded"></div>
          </div>
        </div>
        <BottomNav />
      </div>
    );
  }

  if (!profile || !session) return null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto pt-20 pb-24 px-4">
        <div className="flex flex-col items-center mb-6">
          <div className="relative mb-4">
            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-primary/10">
              {profile.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={profile.full_name || "User"}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                  <Camera className="w-8 h-8 text-gray-500" />
                </div>
              )}
            </div>
            <Button
              size="icon"
              variant="outline"
              className="absolute bottom-0 right-0 rounded-full bg-background"
              onClick={() => setIsProfileDialogOpen(true)}
            >
              <Edit className="h-4 w-4" />
            </Button>
          </div>

          <h1 className="text-2xl font-bold mb-1">{profile.full_name}</h1>
          <p className="text-muted-foreground mb-2">@{profile.username}</p>

          <div className="flex gap-2 mb-4">
            <Button
              variant="outline"
              size="sm"
              className="h-8"
              onClick={() => navigate("/config")}
            >
              <Settings className="h-4 w-4 mr-1" />
              Configurações
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-red-500 border-red-500 hover:bg-red-500/10"
              onClick={handleSignOut}
            >
              <LogOut className="h-4 w-4 mr-1" />
              Sair
            </Button>
          </div>

          <div className="flex gap-2 mb-4">
            <Link to="/products/new">
              <Button
                variant="outline"
                size="sm"
                className="h-8"
              >
                <Store className="h-4 w-4 mr-1" />
                Novo Produto
              </Button>
            </Link>
            {profile.whatsapp && (
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-green-500 border-green-500 hover:bg-green-500/10"
                onClick={openWhatsApp}
              >
                <Phone className="h-4 w-4 mr-1" />
                WhatsApp
              </Button>
            )}
            {profile.instagram && (
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-pink-500 border-pink-500 hover:bg-pink-500/10"
                onClick={openInstagram}
              >
                <Instagram className="h-4 w-4 mr-1" />
                Instagram
              </Button>
            )}
          </div>

          {profile.bio && (
            <div className="text-center max-w-md mb-4">
              <p className="text-sm">{profile.bio}</p>
            </div>
          )}

          <div className="flex flex-wrap gap-2 justify-center mb-4">
            {profile.city && profile.state && (
              <Badge variant="outline" className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {profile.city}, {profile.state}
              </Badge>
            )}
            {profile.occupation && (
              <Badge variant="outline">{profile.occupation}</Badge>
            )}
            {profile.relationship_status && (
              <Badge variant="outline">{profile.relationship_status}</Badge>
            )}
          </div>
        </div>

        <ProfileTabs 
          userProducts={userProducts} 
          userPosts={userPosts}
          isLoading={isProductsLoading || isPostsLoading}
          profileUserId={session.user.id}
          isOwnProfile={true}
        />
      </div>
      <BottomNav />
      <EditProfileDialog
        open={isProfileDialogOpen}
        onOpenChange={setIsProfileDialogOpen}
        profile={profile}
      />
    </div>
  );
};

export default Profile;
