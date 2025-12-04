import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/context/authContext";
import {
    ACCESS_TOKEN_KEY,
    REFRESH_TOKEN_KEY,
} from "@/lib/constants/auth.constants";

export default function GoogleCallbackPage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { refresh } = useAuth();

    useEffect(() => {
        const accessToken = searchParams.get("accessToken");
        const refreshToken = searchParams.get("refreshToken");

        if (accessToken && refreshToken) {
            localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
            localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
            refresh();
            navigate("/");
        } else {
            navigate("/login");
        }
    }, [searchParams, navigate, refresh]);

    return (
        <div className="flex items-center justify-center min-h-screen">
            <p>Processing login...</p>
        </div>
    );
}
