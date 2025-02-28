
import { useState, useEffect } from "react";
import { Bell, UserPlus, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import Navbar from "./Navbar";
import SubNav from "./SubNav";
import Footer from "./Footer";
import BottomNav from "./BottomNav";
import { Notification, Profile } from "@/types/database";
import { followUser, unfollowUser } from "@/lib/api/profile";

export default function Notify() {
  const { toast: showToast } = useToast();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = "Notificações | Vale Notícias";
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        showToast({
          title: "Você precisa estar logado",
          description: "Por favor, faça login para ver suas notificações",
          variant: "destructive",
        });
        navigate('/login');
        return;
      }

      const { data, error } = await supabase
        .from('notifications')
        .select(`
          *,
          follower:follower_id(
            id,
            username,
            full_name,
            avatar_url
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      // Mark all unread notifications as read
      const unreadIds = data?.filter(notification => !notification.read).map(notification => notification.id) || [];
      
      if (unreadIds.length > 0) {
        await supabase
          .from('notifications')
          .update({ read: true })
          .in('id', unreadIds);
      }

      setNotifications(data || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      showToast({
        title: "Erro ao carregar notificações",
        description: "Não foi possível carregar suas notificações",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'event':
        return '🗓️';
      case 'news':
        return '📰';
      case 'system':
        return '⚙️';
      case 'follow':
        return '👤';
      default:
        return '📣';
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    switch (notification.type) {
      case 'event':
        if (notification.reference_id) {
          navigate(`/event/${notification.reference_id}`);
        }
        break;
      case 'news':
        if (notification.reference_id) {
          navigate(`/news/${notification.reference_id}`);
        }
        break;
      case 'follow':
        if (notification.follower_id) {
          navigate(`/profile/${notification.follower_id}`);
        }
        break;
      default:
        // For other notification types
        break;
    }
  };

  const handleFollowBack = async (followerId: string) => {
    try {
      await followUser(followerId);
      toast.success("Usuário seguido com sucesso!");
      
      // Update the notifications list to reflect the follow action
      fetchNotifications();
    } catch (error) {
      console.error('Error following user:', error);
      toast.error("Erro ao seguir usuário");
    }
  };

  const handleUnfollow = async (followerId: string) => {
    try {
      await unfollowUser(followerId);
      toast.success("Deixou de seguir o usuário");
      
      // Update the notifications list to reflect the unfollow action
      fetchNotifications();
    } catch (error) {
      console.error('Error unfollowing user:', error);
      toast.error("Erro ao deixar de seguir usuário");
    }
  };

  const checkIfFollowing = async (followerId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;
    
    const { data, error } = await supabase
      .from('followers')
      .select('*')
      .eq('follower_id', user.id)
      .eq('followed_id', followerId)
      .single();
    
    if (error || !data) return false;
    return true;
  };

  const formatNotificationTime = (created_at: string) => {
    return formatDistanceToNow(new Date(created_at), {
      addSuffix: true,
      locale: ptBR
    });
  };

  const renderFollowButton = (notification: Notification) => {
    if (!notification.follower_id || !notification.follower) return null;
    
    const [isFollowing, setIsFollowing] = useState(false);
    
    // Check if the current user is following the follower
    useEffect(() => {
      const checkFollowStatus = async () => {
        const following = await checkIfFollowing(notification.follower_id!);
        setIsFollowing(following);
      };
      
      checkFollowStatus();
    }, [notification.follower_id]);
    
    if (isFollowing) {
      return (
        <Button 
          variant="outline" 
          size="sm" 
          className="ml-auto" 
          onClick={(e) => {
            e.stopPropagation();
            handleUnfollow(notification.follower_id!);
          }}
        >
          <Check className="h-4 w-4 mr-1" />
          Seguindo
        </Button>
      );
    } else {
      return (
        <Button 
          variant="default" 
          size="sm" 
          className="ml-auto" 
          onClick={(e) => {
            e.stopPropagation();
            handleFollowBack(notification.follower_id!);
          }}
        >
          <UserPlus className="h-4 w-4 mr-1" />
          Seguir de volta
        </Button>
      );
    }
  };

  return (
    <div className="min-h-screen flex flex-col pb-[72px] md:pb-0">
      <Navbar />
      <SubNav />
      <main className="flex-1 container mx-auto p-4">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Notificações</h1>
          <Bell className="h-6 w-6" />
        </div>

        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all">Todas</TabsTrigger>
            <TabsTrigger value="unread">Não lidas</TabsTrigger>
            <TabsTrigger value="follow">Seguidores</TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            {loading ? (
              <div className="flex justify-center items-center h-40">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : notifications.length > 0 ? (
              <div className="space-y-4">
                {notifications.map((notification) => (
                  <Card 
                    key={notification.id} 
                    className={`cursor-pointer transition-all hover:shadow-md ${notification.read ? 'opacity-80' : 'border-l-4 border-l-primary'}`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <CardHeader className="p-4 pb-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {notification.type === 'follow' && notification.follower ? (
                            <Avatar>
                              <AvatarImage src={notification.follower.avatar_url || ''} alt={notification.follower.username} />
                              <AvatarFallback>{notification.follower.username?.[0]?.toUpperCase() || '?'}</AvatarFallback>
                            </Avatar>
                          ) : (
                            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary">
                              {getNotificationIcon(notification.type)}
                            </div>
                          )}
                          <div>
                            <CardTitle className="text-base">
                              {notification.title}
                              {!notification.read && (
                                <Badge variant="secondary" className="ml-2 text-xs">Novo</Badge>
                              )}
                            </CardTitle>
                            <CardDescription className="text-xs">
                              {formatNotificationTime(notification.created_at)}
                            </CardDescription>
                          </div>
                        </div>
                        {notification.type === 'follow' && renderFollowButton(notification)}
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 pt-2">
                      {notification.type === 'follow' && notification.follower ? (
                        <div className="flex items-center">
                          <p className="text-sm text-muted-foreground">
                            <span className="font-medium text-foreground">{notification.follower.full_name}</span>
                            <span className="text-xs ml-1">@{notification.follower.username}</span>
                            {notification.message}
                          </p>
                        </div>
                      ) : (
                        <p className="text-sm">{notification.message}</p>
                      )}
                      {notification.publication_title && (
                        <p className="text-sm font-medium mt-1">{notification.publication_title}</p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center p-8">
                <p className="text-muted-foreground">Você não tem notificações ainda</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="unread">
            {loading ? (
              <div className="flex justify-center items-center h-40">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : notifications.filter(n => !n.read).length > 0 ? (
              <div className="space-y-4">
                {notifications
                  .filter(notification => !notification.read)
                  .map((notification) => (
                    <Card 
                      key={notification.id} 
                      className="cursor-pointer transition-all hover:shadow-md border-l-4 border-l-primary"
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <CardHeader className="p-4 pb-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {notification.type === 'follow' && notification.follower ? (
                              <Avatar>
                                <AvatarImage src={notification.follower.avatar_url || ''} alt={notification.follower.username} />
                                <AvatarFallback>{notification.follower.username?.[0]?.toUpperCase() || '?'}</AvatarFallback>
                              </Avatar>
                            ) : (
                              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary">
                                {getNotificationIcon(notification.type)}
                              </div>
                            )}
                            <div>
                              <CardTitle className="text-base">
                                {notification.title}
                                <Badge variant="secondary" className="ml-2 text-xs">Novo</Badge>
                              </CardTitle>
                              <CardDescription className="text-xs">
                                {formatNotificationTime(notification.created_at)}
                              </CardDescription>
                            </div>
                          </div>
                          {notification.type === 'follow' && renderFollowButton(notification)}
                        </div>
                      </CardHeader>
                      <CardContent className="p-4 pt-2">
                        {notification.type === 'follow' && notification.follower ? (
                          <div className="flex items-center">
                            <p className="text-sm text-muted-foreground">
                              <span className="font-medium text-foreground">{notification.follower.full_name}</span>
                              <span className="text-xs ml-1">@{notification.follower.username}</span>
                              {notification.message}
                            </p>
                          </div>
                        ) : (
                          <p className="text-sm">{notification.message}</p>
                        )}
                        {notification.publication_title && (
                          <p className="text-sm font-medium mt-1">{notification.publication_title}</p>
                        )}
                      </CardContent>
                    </Card>
                  ))}
              </div>
            ) : (
              <div className="text-center p-8">
                <p className="text-muted-foreground">Você não tem notificações não lidas</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="follow">
            {loading ? (
              <div className="flex justify-center items-center h-40">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : notifications.filter(n => n.type === 'follow').length > 0 ? (
              <div className="space-y-4">
                {notifications
                  .filter(notification => notification.type === 'follow')
                  .map((notification) => (
                    <Card 
                      key={notification.id} 
                      className={`cursor-pointer transition-all hover:shadow-md ${notification.read ? 'opacity-80' : 'border-l-4 border-l-primary'}`}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <CardHeader className="p-4 pb-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {notification.follower ? (
                              <Avatar>
                                <AvatarImage src={notification.follower.avatar_url || ''} alt={notification.follower.username} />
                                <AvatarFallback>{notification.follower.username?.[0]?.toUpperCase() || '?'}</AvatarFallback>
                              </Avatar>
                            ) : (
                              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary">
                                👤
                              </div>
                            )}
                            <div>
                              <CardTitle className="text-base">
                                {notification.title}
                                {!notification.read && (
                                  <Badge variant="secondary" className="ml-2 text-xs">Novo</Badge>
                                )}
                              </CardTitle>
                              <CardDescription className="text-xs">
                                {formatNotificationTime(notification.created_at)}
                              </CardDescription>
                            </div>
                          </div>
                          {renderFollowButton(notification)}
                        </div>
                      </CardHeader>
                      <CardContent className="p-4 pt-2">
                        {notification.follower ? (
                          <div className="flex items-center">
                            <p className="text-sm text-muted-foreground">
                              <span className="font-medium text-foreground">{notification.follower.full_name}</span>
                              <span className="text-xs ml-1">@{notification.follower.username}</span>
                              {notification.message}
                            </p>
                          </div>
                        ) : (
                          <p className="text-sm">{notification.message}</p>
                        )}
                      </CardContent>
                    </Card>
                  ))}
              </div>
            ) : (
              <div className="text-center p-8">
                <p className="text-muted-foreground">Você não tem notificações de seguidores</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
      <BottomNav />
    </div>
  );
}
