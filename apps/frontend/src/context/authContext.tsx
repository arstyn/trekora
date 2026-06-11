import React, { createContext, useContext, useEffect, useState } from "react";
import { getAccessToken, logout } from "@/lib/auth-utils";
import axiosInstance from "@/lib/axios";
import type { IUser } from "@/types/user.types";

const AuthContext = createContext({
	isAuthenticated: false,
	user: null as IUser | null,
	loading: true,
	logout: () => {},
	refresh: () => Promise.resolve(),
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
	const [isAuthenticated, setIsAuthenticated] = useState(false);
	const [user, setUser] = useState<IUser | null>(null);
	const [loading, setLoading] = useState(true);

	const checkAuth = async () => {
		const token = await getAccessToken();
		if (token) {
			try {
				const res = await axiosInstance.get("/employee/profile");
				setUser(res.data?.user || null);
				setIsAuthenticated(true);
			} catch (err) {
				console.error("Auth check failed", err);
				setIsAuthenticated(false);
				setUser(null);
			}
		} else {
			setIsAuthenticated(false);
			setUser(null);
		}
		setLoading(false);
	};

	useEffect(() => {
		checkAuth();
		window.addEventListener("storage", checkAuth); // react to login/logout in other tabs
		return () => window.removeEventListener("storage", checkAuth);
	}, []);

	return (
		<AuthContext.Provider
			value={{
				isAuthenticated,
				user,
				loading,
				logout: () => {
					logout();
					setIsAuthenticated(false);
					setUser(null);
				},
				refresh: checkAuth,
			}}
		>
			{children}
		</AuthContext.Provider>
	);
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);
