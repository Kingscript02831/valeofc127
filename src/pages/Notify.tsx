
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Navbar from "@/components/Navbar";
import BottomNav from "@/components/BottomNav";
import FollowNotification from "@/components/FollowNotification";
import { useNotifications } from "@/hooks/useNotifications";
import NotificationDebugger from "@/components/NotificationDebugger";

const Notify = () => {
  const [activeTab, setActiveTab] = useState("all");
  const [showDebugger, setShowDebugger] = useState(false);
  
  const {
    notifications,
    isLoading,
    unreadCount,
    currentUser,
    markAsRead,
    markAllAsRead
  } = useNotifications();

  const filteredNotifications = notifications?.filter((notification) => {
    if (activeTab === "all") return true;
    if (activeTab === "unread") return !notification.read;
    return true;
  });

  // Debug information
  console.log("Component rendering with:");
  console.log("- Notifications:", notifications?.length || 0);
  console.log("- Filtered Notifications:", filteredNotifications?.length || 0);
  console.log("- Is Loading:", isLoading);
  console.log("- Current User:", currentUser?.id);
  console.log("- Active Tab:", activeTab);

  return (
    <div className="bg-background min-h-screen pb-20">
      <Navbar />
      <div className="container max-w-2xl mx-auto pt-16 p-4">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">
            Notificações
            <button 
              onClick={() => setShowDebugger(!showDebugger)}
              className="ml-2 text-xs text-gray-400 hover:text-gray-600"
            >
              {showDebugger ? "(Esconder debug)" : "(Debug)"}
            </button>
          </h1>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="text-sm text-blue-500 hover:underline"
            >
              Marcar todas como lidas
            </button>
          )}
        </div>

        {showDebugger && <NotificationDebugger />}

        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="all">Todas</TabsTrigger>
            <TabsTrigger value="unread">
              Não lidas {unreadCount > 0 ? `(${unreadCount})` : ""}
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
                    onUpdateRead={markAsRead}
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
                    onUpdateRead={markAsRead}
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
      </div>
      <BottomNav />
    </div>
  );
};

export default Notify;
