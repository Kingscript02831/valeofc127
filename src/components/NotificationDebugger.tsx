
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const NotificationDebugger = () => {
  const { data: currentUser } = useQuery({
    queryKey: ["currentUser"],
    queryFn: async () => {
      const { data } = await supabase.auth.getUser();
      return data.user;
    },
  });

  const { data: rawNotifications, isLoading, isError, error } = useQuery({
    queryKey: ["rawNotifications", currentUser?.id],
    queryFn: async () => {
      if (!currentUser) return null;
      
      const { data, error } = await supabase
        .from("notifications")
        .select('*')
        .eq("user_id", currentUser.id);
        
      if (error) throw error;
      return data;
    },
    enabled: !!currentUser,
  });

  return (
    <Card className="my-4">
      <CardHeader>
        <CardTitle>Notification Debugger</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-sm space-y-2">
          <p><strong>User ID:</strong> {currentUser?.id || 'Not logged in'}</p>
          <p><strong>Loading:</strong> {isLoading ? 'Yes' : 'No'}</p>
          <p><strong>Error:</strong> {isError ? 'Yes' : 'No'}</p>
          {error && <p><strong>Error Message:</strong> {JSON.stringify(error)}</p>}
          <p><strong>Raw Notification Count:</strong> {rawNotifications?.length || 0}</p>
          
          {rawNotifications && rawNotifications.length > 0 ? (
            <div>
              <p className="font-medium mt-4">Raw Notifications:</p>
              <pre className="bg-muted p-2 rounded text-xs overflow-auto max-h-40">
                {JSON.stringify(rawNotifications, null, 2)}
              </pre>
            </div>
          ) : (
            <p className="italic">No raw notifications found</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default NotificationDebugger;
