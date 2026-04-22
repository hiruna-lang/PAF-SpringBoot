import { useCallback, useEffect, useRef, useState } from "react";
import { isLoggedIn } from "./authService";
import {
  fetchNotifications,
  markAllRead as apiMarkAllRead,
  markRead as apiMarkRead,
} from "./notificationService";

const POLL_MS = 30_000;

/**
 * Custom hook that manages M4 notifications.
 * Returns: { notifications, unreadCount, loading, refresh, markRead, markAllRead }
 */
export function useNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const intervalRef = useRef(null);

  const refresh = useCallback(async () => {
    if (!isLoggedIn()) return;
    try {
      const data = await fetchNotifications();
      setNotifications(data);
    } catch {
      // silently ignore — network errors shouldn't break the UI
    }
  }, []);

  // Initial load + polling
  useEffect(() => {
    if (!isLoggedIn()) return;
    refresh();
    intervalRef.current = setInterval(refresh, POLL_MS);
    return () => clearInterval(intervalRef.current);
  }, [refresh]);

  const markRead = useCallback(async (id) => {
    try {
      const updated = await apiMarkRead(id);
      setNotifications((prev) => prev.map((n) => (n.id === id ? updated : n)));
    } catch {
      // ignore
    }
  }, []);

  const markAllRead = useCallback(async () => {
    setLoading(true);
    try {
      const updated = await apiMarkAllRead();
      setNotifications(updated);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return { notifications, unreadCount, loading, refresh, markRead, markAllRead };
}
