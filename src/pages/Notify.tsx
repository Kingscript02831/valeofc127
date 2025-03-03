import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../integrations/supabase/client";
import { Card, CardContent } from "../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import Navbar from "../components/Navbar";
import BottomNav from "../components/BottomNav";
import FollowNotification from "../components/FollowNotification";
import NotificationTester from "../components/NotificationTester";
import { formatDate } from "../lib/utils";
import { toast } from "sonner";

interface Notification {
  id: string;
  user_id: string;
  sender_id: string;
  title: string;
  message: string;
  created_at: string;
  read: boolean;
  type: string;
  sender?: {
    username: string;
    avatar_url: string;
    id: string;
  };
}

const Notify = () => {
  const [activeTab, setActiveTab] = useState("all");
  const queryClient = useQueryClient();

  const { data: currentUser } = useQuery({
    queryKey: ["currentUser"],
    queryFn: async () => {
      const { data } = await supabase.auth.getUser();
      if (data.user) {
        console.log("Current user:", data.user);
      }
      return data.user;
    },
  });

  const { data: notifications, isLoading } = useQuery({
    queryKey: ["notifications", currentUser?.id],
    queryFn: async () => {
      if (!currentUser) return [];

      console.log("Fetching notifications for user:", currentUser.id);

      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", currentUser.id)
        .single();
        
      console.log("Current user profile:", profileData, profileError);

      const { data, error } = await supabase
        .from("notifications")
        .select(`
          *,
          sender:profiles!notifications_sender_id_fkey(
            id,
            username,
            avatar_url
          )
        `)
        .eq("user_id", currentUser.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching notifications:", error);
        return [];
      }

      console.log("Notifications fetched:", data);
      return data as Notification[];
    },
    enabled: !!currentUser,
  });

  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      const { error } = await supabase
        .from("notifications")
        .update({ read: true })
        .eq("id", notificationId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
    onError: () => {
      toast.error("Erro ao marcar notificação como lida");
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      if (!currentUser) return;

      const { error } = await supabase
        .from("notifications")
        .update({ read: true })
        .eq("user_id", currentUser.id)
        .eq("read", false);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      toast.success("Todas as notificações foram marcadas como lidas");
    },
    onError: () => {
      toast.error("Erro ao marcar todas notificações como lidas");
    },
  });

  const filteredNotifications = notifications?.filter((notification) => {
    if (activeTab === "all") return true;
    if (activeTab === "unread") return !notification.read;
    return true;
  });

  const unreadCount = notifications?.filter(
    (notification) => !notification.read
  ).length;

  const handleMarkAsRead = (notificationId: string) => {
    markAsReadMutation.mutate(notificationId);
  };

  const handleMarkAllAsRead = () => {
    markAllAsReadMutation.mutate();
  };

  return (
    <div className="bg-background min-h-screen pb-20">
      <Navbar />
      <div className="container max-w-2xl mx-auto pt-16 p-4">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Notificações</h1>
          {unreadCount && unreadCount > 0 ? (
            <button
              onClick={handleMarkAllAsRead}
              className="text-sm text-blue-500 hover:underline"
            >
              Marcar todas como lidas
            </button>
          ) : null}
        </div>

        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="all">Todas</TabsTrigger>
            <TabsTrigger value="unread">
              Não lidas {unreadCount ? `(${unreadCount})` : ""}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700" />
                        <div className="flex-1">
                          <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
                          <div className="h-3 w-40 bg-gray-200 dark:bg-gray-700 rounded" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredNotifications && filteredNotifications.length > 0 ? (
              <div>
                {filteredNotifications.map((notification) => (
                  <FollowNotification
                    key={notification.id}
                    notification={notification}
                    currentUser={currentUser}
                    onUpdateRead={handleMarkAsRead}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-10 text-muted-foreground">
                Nenhuma notificação encontrada
              </div>
            )}
          </TabsContent>

          <TabsContent value="unread" className="space-y-4">
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700" />
                        <div className="flex-1">
                          <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
                          <div className="h-3 w-40 bg-gray-200 dark:bg-gray-700 rounded" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredNotifications && filteredNotifications.length > 0 ? (
              <div>
                {filteredNotifications.map((notification) => (
                  <FollowNotification
                    key={notification.id}
                    notification={notification}
                    currentUser={currentUser}
                    onUpdateRead={handleMarkAsRead}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-10 text-muted-foreground">
                Nenhuma notificação não lida
              </div>
            )}
          </TabsContent>
        </Tabs>
        
        <NotificationTester />
      </div>
      <BottomNav />
    </div>
  );
};

export default Notify;
