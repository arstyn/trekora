import React, { createContext, useContext, useEffect, useState } from "react";
import { getAccessToken, logout } from "@/lib/auth-utils";

const AuthContext = createContext({
	isAuthenticated: false,
	logout: () => {},
	refresh: () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
	const [isAuthenticated, setIsAuthenticated] = useState(false);

	const checkAuth = async () => {
		const token = await getAccessToken();
		setIsAuthenticated(!!token);
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
				logout: () => {
					logout();
					setIsAuthenticated(false);
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
