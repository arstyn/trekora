import { useEffect, useState } from "react";

export function useTheme() {
	const [theme, setThemeState] = useState<"light" | "dark" | "system">("system");

	useEffect(() => {
		const saved = localStorage.getItem("theme") as "light" | "dark" | "system" | null;
		if (saved) {
			setTheme(saved);
		} else {
			setTheme("system");
		}
	}, []);

	const setTheme = (newTheme: "light" | "dark" | "system") => {
		setThemeState(newTheme);
		localStorage.setItem("theme", newTheme);

		const root = window.document.documentElement;

		if (newTheme === "system") {
			const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
			root.classList.toggle("dark", prefersDark);
		} else {
			root.classList.toggle("dark", newTheme === "dark");
		}
	};

	useEffect(() => {
		if (theme === "system") {
			const handler = (e: MediaQueryListEvent) => {
				document.documentElement.classList.toggle("dark", e.matches);
			};
			const media = window.matchMedia("(prefers-color-scheme: dark)");
			media.addEventListener("change", handler);

			return () => media.removeEventListener("change", handler);
		}
	}, [theme]);

	return { theme, setTheme };
}
