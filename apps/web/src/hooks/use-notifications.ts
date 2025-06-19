import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

// Replace with your backend API URL
const WS_URL = process.env.NEXT_PUBLIC_API_WS_URL || 'http://localhost:3000';

export interface Notification {
  id: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export function useNotifications(token: string | null) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const socketRef = useRef<Socket | null>(null);

  // Connect to WebSocket on mount
  useEffect(() => {
    if (!token) return;
    const socket = io(WS_URL, {
      query: { token },
      transports: ['websocket'],
    });
    socketRef.current = socket;

    socket.on('notification', (notification: Notification) => {
      setNotifications((prev) => [notification, ...prev]);
      setUnreadCount((prev) => prev + 1);
    });

    return () => {
      socket.disconnect();
    };
  }, [token]);

  // Fetch initial notifications from API
  useEffect(() => {
    if (!token) return;
    fetch('/api/notifications', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setNotifications(data);
        setUnreadCount(data.filter((n: Notification) => !n.isRead).length);
      });
  }, [token]);

  // Mark notification as read
  const markAsRead = useCallback(
    async (id: string) => {
      if (!token) return;
      await fetch(`/api/notifications/${id}/read`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    },
    [token],
  );

  return { notifications, unreadCount, markAsRead };
}
