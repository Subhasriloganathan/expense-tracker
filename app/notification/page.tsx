"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface Notification {
  id: number;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const supabase = createClient();

  useEffect(() => {
    loadNotifications();
  }, []);

  async function loadNotifications() {
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (!error) {
      setNotifications(data || []);
    }

    setLoading(false);
  }

  async function markAsRead(id: number) {
    await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("id", id);

    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === id
          ? { ...notification, is_read: true }
          : notification
      )
    );
  }

  async function deleteNotification(id: number) {
    await supabase
      .from("notifications")
      .delete()
      .eq("id", id);

    setNotifications((prev) =>
      prev.filter((notification) => notification.id !== id)
    );
  }

  async function markAllAsRead() {
    const unreadIds = notifications
      .filter((notification) => !notification.is_read)
      .map((notification) => notification.id);

    if (unreadIds.length === 0) return;

    await supabase
      .from("notifications")
      .update({ is_read: true })
      .in("id", unreadIds);

    setNotifications((prev) =>
      prev.map((notification) => ({
        ...notification,
        is_read: true,
      }))
    );
  }

  const unreadCount = notifications.filter(
    (notification) => !notification.is_read
  ).length;

  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              🔔 Notifications
            </h1>

            <p className="mt-1 text-gray-600">
              You have {unreadCount} unread notification
              {unreadCount !== 1 ? "s" : ""}.
            </p>
          </div>

          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700"
            >
              Mark All as Read
            </button>
          )}
        </div>

        {loading ? (
          <div className="rounded-xl bg-white p-8 text-center shadow">
            Loading notifications...
          </div>
        ) : notifications.length === 0 ? (
          <div className="rounded-xl bg-white p-10 text-center shadow">
            <div className="text-5xl">🔔</div>

            <h2 className="mt-4 text-xl font-bold text-gray-800">
              No Notifications
            </h2>

            <p className="mt-2 text-gray-500">
              You're all caught up!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`rounded-xl border bg-white p-5 shadow-sm ${
                  !notification.is_read
                    ? "border-blue-300 bg-blue-50"
                    : "border-gray-200"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex gap-4">
                    <div className="text-2xl">
                      {notification.type === "warning"
                        ? "⚠️"
                        : notification.type === "success"
                        ? "✅"
                        : "🔔"}
                    </div>

                    <div>
                      <h2 className="font-bold text-gray-900">
                        {notification.title}
                      </h2>

                      <p className="mt-1 text-gray-600">
                        {notification.message}
                      </p>

                      <p className="mt-2 text-sm text-gray-400">
                        {new Date(
                          notification.created_at
                        ).toLocaleString("en-IN")}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {!notification.is_read && (
                      <button
                        onClick={() => markAsRead(notification.id)}
                        className="rounded-lg border border-blue-300 px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-100"
                      >
                        Read
                      </button>
                    )}

                    <button
                      onClick={() => deleteNotification(notification.id)}
                      className="rounded-lg border border-red-300 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-100"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}