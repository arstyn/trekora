import React, { createContext, useContext, useEffect, useState } from "react";
import { getAccessToken, logout } from "@/lib/auth-utils";
import axiosInstance from "@/lib/axios";
import type { IUser } from "@/types/user.types";

const AuthContext = createContext({
	isAuthenticated: false,
	user: null as IUser | null,
	loading: true,
	isBackendDown: false,
	logout: () => {},
	refresh: () => Promise.resolve() as Promise<void>,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
	const [isAuthenticated, setIsAuthenticated] = useState(false);
	const [user, setUser] = useState<IUser | null>(null);
	const [loading, setLoading] = useState(true);
	const [isBackendDown, setIsBackendDown] = useState(false);

	const checkAuth = async () => {
		const hasToken = !!localStorage.getItem("accessToken") || !!localStorage.getItem("refreshToken");
		try {
			const token = await getAccessToken();
			if (token) {
				const res = await axiosInstance.get("/employee/profile");
				if (res.data && res.data.user) {
					setUser({
						...res.data.user,
						organization: res.data.organization,
						branch: res.data.branch,
					});
				} else {
					setUser(null);
				}
				setIsAuthenticated(true);
				setIsBackendDown(false);
			} else {
				setIsAuthenticated(false);
				setUser(null);
				setIsBackendDown(false);
			}
		} catch (err: any) {
			console.error("Auth check failed", err);
			const isNetwork = !err.response && (err.request || err.code === "ERR_NETWORK" || err.message === "Network Error");
			if (isNetwork) {
				setIsBackendDown(true);
				if (hasToken) {
					setIsAuthenticated(true);
				}
			} else {
				setIsAuthenticated(false);
				setUser(null);
				setIsBackendDown(false);
			}
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
				isBackendDown,
				logout: () => {
					logout();
					setIsAuthenticated(false);
					setUser(null);
					setIsBackendDown(false);
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
