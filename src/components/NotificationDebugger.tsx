
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
      
      console.log("DEBUG: Fetching raw notifications for user:", currentUser.id);
      
      // Perform a simple select to get all notifications
      const { data, error } = await supabase
        .from("notifications")
        .select('*')
        .eq("user_id", currentUser.id);
        
      if (error) {
        console.error("DEBUG: Error fetching raw notifications:", error);
        throw error;
      }
      
      console.log("DEBUG: Raw notifications fetched:", data);
      return data;
    },
    enabled: !!currentUser,
    retry: 2,
  });

  // Get profile data to check if there might be missing data
  const { data: profiles } = useQuery({
    queryKey: ["debugProfiles", rawNotifications],
    queryFn: async () => {
      if (!rawNotifications || rawNotifications.length === 0) return null;
      
      // Collect all sender IDs
      const senderIds = rawNotifications
        .map(n => n.sender_id)
        .filter(Boolean);
      
      if (senderIds.length === 0) return null;
      
      // Fetch profiles to check if they exist
      const { data, error } = await supabase
        .from("profiles")
        .select('*')
        .in('id', senderIds);
        
      if (error) {
        console.error("Error fetching sender profiles:", error);
        return null;
      }
      
      return data;
    },
    enabled: !!rawNotifications && rawNotifications.length > 0,
  });

  // Try to get RLS policy info
  const { data: rlsInfo } = useQuery({
    queryKey: ["rlsInfo"],
    queryFn: async () => {
      const { data, error } = await supabase
        .rpc('check_notifications_for_user');
      
      if (error) {
        console.error("Error checking RLS info:", error);
        return null;
      }
      
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
          <p><strong>Sender Profiles Found:</strong> {profiles?.length || 0}</p>
          
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
          
          <div className="mt-4 p-2 bg-yellow-100 dark:bg-yellow-900 rounded">
            <p className="font-medium">Query Troubleshooting:</p>
            <p className="text-xs mt-1">
              The notification system uses a Supabase query with foreign key relationships. 
              If notifications are visible in the raw data but not in the UI, there might be 
              an issue with the join query or missing profile data.
            </p>
            
            {profiles && profiles.length > 0 && (
              <div className="mt-2">
                <p className="text-xs font-medium">Found {profiles.length} sender profiles:</p>
                <pre className="bg-muted mt-1 p-1 rounded text-xs overflow-auto max-h-20">
                  {JSON.stringify(profiles.map(p => ({ id: p.id, username: p.username })), null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default NotificationDebugger;
