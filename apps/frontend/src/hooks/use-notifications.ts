import { getAccessToken } from "@/lib/auth-utils";
import axiosInstance from "@/lib/axios";
import { BACKEND_API } from "@/lib/constants/url.constants";
import { useCallback, useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { toast } from "sonner";

export interface Notification {
	id: string;
	message: string;
	isRead: boolean;
	createdAt: string;
}

export function useNotifications() {
	const [notifications, setNotifications] = useState<Notification[]>([]);
	const [unreadCount, setUnreadCount] = useState(0);
	const socketRef = useRef<Socket | null>(null);

	// Connect to WebSocket on mount
	useEffect(() => {
		let socket: Socket | undefined;
		const connectToSocket = async () => {
			const token = await getAccessToken();

			if (!token) return;
			const socket = io(BACKEND_API, {
				query: { token },
				transports: ["websocket"],
			});
			socketRef.current = socket;

			socket.on("notification", (notification: Notification) => {
				setNotifications((prev) => [notification, ...prev]);
				setUnreadCount((prev) => prev + 1);
				toast(`New Notification:`, {
					description: notification.message,
					action: {
						label: "View",
						onClick: () => console.log("test"),
					},
				});
			});
		};

		connectToSocket();

		return () => {
			if (socket) {
				socket.disconnect();
			}
		};
	}, []);

	// Fetch initial notifications from API
	useEffect(() => {
		axiosInstance.get<Notification[]>("/notification").then((data) => {
			setNotifications(data.data);
			setUnreadCount(data.data.filter((n: Notification) => !n.isRead).length);
		});
	}, []);

	// Mark notification as read
	const markAsRead = useCallback(async (id: string) => {
		await axiosInstance.patch(`/notification/${id}/read`, {});
		setNotifications((prev) =>
			prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
		);
		setUnreadCount((prev) => Math.max(0, prev - 1));
	}, []);

	return { notifications, unreadCount, markAsRead };
}
