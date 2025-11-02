"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useUserNotifications, useMarkAllNotificationsAsRead } from "@/hooks/swr/useUser";

export default function NotificationsPage() {
  const { notifications, isLoading, isError, error, mutate } = useUserNotifications();
  const { markAllAsRead, isUpdating } = useMarkAllNotificationsAsRead();

  const handleMarkAllRead = async () => {
    try {
      await markAllAsRead();
      mutate(); // Refresh notifications
    } catch (err) {
      console.error("Failed to mark all notifications as read:", err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-white">Notifications</h1>
        <Button 
          variant="outline" 
          onClick={handleMarkAllRead}
          disabled={isUpdating || isLoading || !notifications || notifications.length === 0}
          className="border-zinc-700 text-zinc-300 hover:border-zinc-600 hover:bg-zinc-800/50 hover:text-white dark:border-zinc-700 dark:text-zinc-300"
          size="sm"
        >
          {isUpdating ? "Updating..." : "Mark all read"}
        </Button>
      </div>
      <Card className="border-zinc-800 bg-zinc-900/50 backdrop-blur-sm shadow-xl dark:border-zinc-800 dark:bg-zinc-900/50">
        <CardHeader className="pb-4">
          <CardTitle className="text-sm font-medium uppercase tracking-wider text-zinc-400 dark:text-zinc-400">
            Recent
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="py-8 text-center text-sm text-zinc-500 dark:text-zinc-400">Loading notifications...</p>
          ) : isError ? (
            <p className="py-8 text-center text-sm text-red-400">
              Error loading notifications: {error?.message || "Unknown error"}
            </p>
          ) : !notifications || notifications.length === 0 ? (
            <p className="py-8 text-center text-sm text-zinc-500 dark:text-zinc-400">No notifications yet.</p>
          ) : (
            <ul className="space-y-3">
              {notifications.map((n) => (
                <li 
                  key={n.id} 
                  className="flex items-start justify-between gap-4 rounded-lg border border-zinc-800/50 bg-zinc-800/20 p-4 transition-colors hover:bg-zinc-800/30 dark:border-zinc-800 dark:bg-zinc-800/20"
                >
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-white">{n.title}</div>
                    <div className="mt-1 text-sm text-zinc-400">{n.message}</div>
                    <div className="mt-2 text-xs text-zinc-500">{new Date(n.createdAt).toLocaleString()}</div>
                  </div>
                  {!n.read && (
                    <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-blue-500" />
                  )}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}


