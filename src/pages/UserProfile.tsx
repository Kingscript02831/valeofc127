
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import BottomNav from "@/components/BottomNav";
import ProfileTabs from "@/components/ProfileTabs";
import { Camera, Instagram, MapPin, Phone } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { calculateDistance } from "@/utils/distance";

const UserProfile = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const [currentUserLocation, setCurrentUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [profileUserId, setProfileUserId] = useState<string | null>(null);

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

  const { data: profileUser, isLoading: isProfileLoading } = useQuery({
    queryKey: ["userProfile", username],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("username", username)
          .single();

        if (error) throw error;
        
        // Save the profile user ID for later use
        setProfileUserId(data.id);
        
        return data;
      } catch (error) {
        console.error("Error fetching user profile:", error);
        navigate("/404");
        return null;
      }
    },
  });

  const { data: userProducts, isLoading: isProductsLoading } = useQuery({
    queryKey: ["userProducts", profileUser?.id],
    queryFn: async () => {
      if (!profileUser?.id) return [];

      try {
        const { data, error } = await supabase
          .from("products")
          .select("*")
          .eq("user_id", profileUser.id)
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
    enabled: !!profileUser?.id,
  });

  const { data: userPosts, isLoading: isPostsLoading } = useQuery({
    queryKey: ["userPosts", profileUser?.id],
    queryFn: async () => {
      if (!profileUser?.id) return [];

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
          .eq("user_id", profileUser.id)
          .order("created_at", { ascending: false });

        if (error) throw error;
        return data;
      } catch (error) {
        console.error("Error fetching user posts:", error);
        return [];
      }
    },
    enabled: !!profileUser?.id,
  });

  const openInstagram = () => {
    if (profileUser?.instagram) {
      window.open(`https://instagram.com/${profileUser.instagram}`, "_blank");
    }
  };

  const openWhatsApp = () => {
    if (profileUser?.whatsapp) {
      const formattedPhone = profileUser.whatsapp.replace(/\D/g, "");
      window.open(`https://wa.me/${formattedPhone}`, "_blank");
    }
  };

  if (isProfileLoading) {
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

  if (!profileUser) return null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto pt-20 pb-24 px-4">
        <div className="flex flex-col items-center mb-6">
          <div className="relative mb-4">
            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-primary/10">
              {profileUser.avatar_url ? (
                <img
                  src={profileUser.avatar_url}
                  alt={profileUser.full_name || "User"}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                  <Camera className="w-8 h-8 text-gray-500" />
                </div>
              )}
            </div>
          </div>

          <h1 className="text-2xl font-bold mb-1">{profileUser.full_name}</h1>
          <p className="text-muted-foreground mb-2">@{profileUser.username}</p>

          <div className="flex gap-2 mb-4">
            {profileUser.whatsapp && (
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
            {profileUser.instagram && (
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

          {profileUser.bio && (
            <div className="text-center max-w-md mb-4">
              <p className="text-sm">{profileUser.bio}</p>
            </div>
          )}

          <div className="flex flex-wrap gap-2 justify-center mb-4">
            {profileUser.city && profileUser.state && (
              <Badge variant="outline" className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {profileUser.city}, {profileUser.state}
              </Badge>
            )}
            {profileUser.occupation && (
              <Badge variant="outline">{profileUser.occupation}</Badge>
            )}
            {profileUser.relationship_status && (
              <Badge variant="outline">{profileUser.relationship_status}</Badge>
            )}
          </div>
        </div>

        <ProfileTabs 
          userProducts={userProducts} 
          userPosts={userPosts}
          isLoading={isProductsLoading || isPostsLoading}
          profileUserId={profileUserId}
          isOwnProfile={false}
        />
      </div>
      <BottomNav />
    </div>
  );
};

export default UserProfile;
