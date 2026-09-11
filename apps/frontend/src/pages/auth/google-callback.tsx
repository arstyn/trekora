import { useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import {
    ACCESS_TOKEN_KEY,
    REFRESH_TOKEN_KEY,
} from "@/lib/constants/auth.constants";

export default function GoogleCallbackPage() {
    const [searchParams] = useSearchParams();
    const hasProcessed = useRef(false);

    useEffect(() => {
        if (hasProcessed.current) return;
        hasProcessed.current = true;

        const accessToken = searchParams.get("accessToken");
        const refreshToken = searchParams.get("refreshToken");
        const isOnboarded = searchParams.get("isOnboarded");

        if (accessToken && refreshToken) {
            localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
            localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);

            const target = isOnboarded === "false" ? "/onboarding" : "/";
            window.location.replace(target);
        } else {
            window.location.replace("/login");
        }
    }, [searchParams]);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground gap-4">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-muted-foreground font-medium animate-pulse">
                Signing you in...
            </p>
        </div>
    );
}
