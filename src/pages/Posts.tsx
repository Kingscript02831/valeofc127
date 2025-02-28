
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from 'date-fns';
import MediaCarousel from "../components/MediaCarousel";
import Navbar from "../components/Navbar";
import SubNav from "../components/SubNav";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import ReactionMenu from "../components/ReactionMenu";
import BottomNav from "../components/BottomNav";
import { Button } from "../components/ui/button";
import { Search, Plus, Share2, Calendar, MapPin, Flag, Eye } from "lucide-react";
import { Input } from "../components/ui/input";
import { emojiLibrary } from "../utils/emojisPosts";
import Tags from "../components/Tags";
import Footer from "../components/Footer"; 
import { useTheme } from "../components/ThemeProvider";
import { useUserLocation, LocationManager } from "../components/locpost";

export default function Posts() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { theme } = useTheme();
  const [searchTerm, setSearchTerm] = useState<string>("");
  const { userLocation, userCity, loading } = useUserLocation();
  const [reactionFilter, setReactionFilter] = useState<string | null>(null);
  const [tagFilter, setTagFilter] = useState<string | null>(null);
  const [currentTab, setCurrentTab] = useState("all");

  useEffect(() => {
    document.title = "Publicações";
  }, []);

  // Fetch posts with pagination
  const {
    data: posts = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["posts", searchTerm, reactionFilter, tagFilter, currentTab],
    queryFn: async () => {
      let query = supabase
        .from("posts")
        .select(
          `*, 
          user:user_id (username, full_name, avatar_url, city), 
          post_likes (reaction_type, user_id),
          post_comments (id)`
        )
        .order("created_at", { ascending: false });

      if (searchTerm) {
        query = query.or(`content.ilike.%${searchTerm}%,user.username.ilike.%${searchTerm}%,user.full_name.ilike.%${searchTerm}%`);
      }

      if (reactionFilter) {
        query = query.eq("post_likes.reaction_type", reactionFilter);
      }

      if (tagFilter) {
        query = query.contains("tags", [tagFilter]);
      }

      // Filter by tab
      if (currentTab === "nearby" && userLocation) {
        // Show posts with location near the user's location
        query = query.not("city", "is", null);
      } else if (currentTab === "following") {
        // Get posts from users the current user follows
        const { data: session } = await supabase.auth.getSession();
        if (session?.session?.user?.id) {
          const { data: followingIds } = await supabase
            .from("follows")
            .select("following_id")
            .eq("follower_id", session.session.user.id);
          
          if (followingIds && followingIds.length > 0) {
            const ids = followingIds.map(f => f.following_id);
            query = query.in("user_id", ids);
          } else {
            // If not following anyone, return empty result
            return [];
          }
        }
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching posts:", error);
        throw new Error(error.message);
      }

      return data || [];
    },
  });

  const calculatePostDistance = (postLocation: { lat: number, lng: number } | null) => {
    if (!userLocation || !postLocation) return null;
    
    const distance = calculateDistance(
      userLocation.lat,
      userLocation.lng,
      postLocation.lat,
      postLocation.lng
    );
    
    return distance > 0 ? `${distance} km` : null;
  };

  return (
    <LocationManager>
      <div className={`min-h-screen ${theme === "dark" ? "bg-black text-white" : "bg-white text-black"}`}>
        <Navbar />
        <SubNav />

        <div className="container mx-auto px-4 py-8 pb-24">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold">Publicações</h1>
            <Button 
              onClick={() => navigate('/post/new')} 
              variant="default" 
              className="flex items-center gap-2 px-4 py-2 rounded-lg"
            >
              <Plus size={18} />
              <span className="hidden md:inline">Nova Publicação</span>
            </Button>
          </div>

          <div className="relative mb-6">
            <Input
              placeholder="Buscar publicações..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-full pl-10 pr-4 py-2"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          </div>

          <Tabs defaultValue="all" value={currentTab} onValueChange={setCurrentTab} className="mb-6">
            <TabsList className="grid w-full grid-cols-3 mb-2">
              <TabsTrigger value="all">Todos</TabsTrigger>
              <TabsTrigger value="nearby">Próximos</TabsTrigger>
              <TabsTrigger value="following">Seguindo</TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Display tags for filtering */}
          <div className="mb-6 overflow-x-auto">
            <Tags 
              selectedTag={tagFilter} 
              onTagSelect={(tag) => setTagFilter(tag === tagFilter ? null : tag)} 
            />
          </div>

          {/* Loading state */}
          {isLoading && (
            <div className="flex justify-center items-center py-10">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
            </div>
          )}

          {/* Error state */}
          {error && (
            <div className="text-center py-10 text-red-500">
              Erro ao carregar publicações. Por favor, tente novamente.
            </div>
          )}

          {/* No posts found */}
          {!isLoading && posts.length === 0 && (
            <div className="text-center py-10 text-gray-500">
              Nenhuma publicação encontrada.
            </div>
          )}

          {/* Posts list */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => {
              // Calculate post distance if location available
              const distance = post.location ? calculatePostDistance(post.location) : null;
              
              // Count reactions by type
              const reactionCounts: { [key: string]: number } = {};
              if (post.post_likes) {
                post.post_likes.forEach((like: any) => {
                  const reaction = like.reaction_type;
                  reactionCounts[reaction] = (reactionCounts[reaction] || 0) + 1;
                });
              }
              
              return (
                <div
                  key={post.id}
                  className={`border ${theme === "dark" ? "border-gray-800" : "border-gray-200"} rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow`}
                >
                  {/* Post header with user info */}
                  <div className="p-4 flex items-center space-x-3">
                    <div 
                      className="h-10 w-10 rounded-full bg-gray-200 overflow-hidden"
                      onClick={() => navigate(`/user/${post.user.username}`)}
                    >
                      {post.user.avatar_url ? (
                        <img 
                          src={post.user.avatar_url} 
                          alt={post.user.username}
                          className="h-full w-full object-cover" 
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center bg-gray-300 text-gray-600">
                          {post.user.username?.[0]?.toUpperCase() || "U"}
                        </div>
                      )}
                    </div>
                    <div>
                      <div 
                        className="font-medium hover:underline cursor-pointer"
                        onClick={() => navigate(`/user/${post.user.username}`)}
                      >
                        {post.user.full_name || post.user.username}
                      </div>
                      <div className="text-sm text-gray-500 flex">
                        <span>{format(new Date(post.created_at), 'dd/MM/yyyy')}</span>
                        {(post.city || post.user?.city) && (
                          <span className="ml-2">
                            {post.city || post.user?.city}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Post content */}
                  <div 
                    className="px-4 pb-2 cursor-pointer"
                    onClick={() => navigate(`/post/${post.id}`)}
                  >
                    <p className="text-sm mb-2">{post.content}</p>
                  </div>

                  {/* Post media */}
                  {post.images && post.images.length > 0 && (
                    <div 
                      className="cursor-pointer" 
                      onClick={() => navigate(`/post/${post.id}`)}
                    >
                      <MediaCarousel
                        images={post.images}
                        videos={post.videos || []}
                        aspectRatio="1:1"
                      />
                    </div>
                  )}

                  {/* Post tags */}
                  {post.tags && post.tags.length > 0 && (
                    <div className="px-4 mt-2 flex flex-wrap gap-1">
                      {post.tags.map((tag: string) => (
                        <span 
                          key={tag}
                          className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs dark:bg-gray-800 dark:text-gray-300"
                          onClick={() => setTagFilter(tag)}
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Post footer with stats and actions */}
                  <div className="p-4 flex items-center justify-between mt-2 border-t border-gray-100 dark:border-gray-800">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center">
                        <ReactionMenu postId={post.id} />
                        <span className="text-sm ml-1">
                          {Object.entries(reactionCounts).map(([reaction, count]) => (
                            <span key={reaction} className="mr-1">
                              {emojiLibrary[reaction as keyof typeof emojiLibrary]} {count}
                            </span>
                          ))}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <button 
                          className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                          onClick={() => navigate(`/post/${post.id}`)}
                        >
                          <Eye size={18} />
                          <span className="text-sm ml-1">{post.view_count || 0}</span>
                        </button>
                      </div>
                    </div>
                    <div>
                      <button 
                        className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                        onClick={() => {
                          navigator.share({
                            title: 'Compartilhar publicação',
                            text: post.content,
                            url: `${window.location.origin}/post/${post.id}`
                          }).catch(err => console.error('Error sharing:', err));
                        }}
                      >
                        <Share2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        <Footer />
        <BottomNav />
      </div>
    </LocationManager>
  );
}
