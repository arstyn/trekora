import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { NavLink } from "react-router-dom";
import LoginForm from "./_component/login-form";

export default function LoginPage() {
    return (
        <div className="relative min-h-screen w-full bg-gradient-to-br from-background to-background/80 flex items-center justify-center p-4">
            {/* Decorative elements */}
            <div className="absolute top-20 left-10 w-64 h-64 rounded-full bg-purple-500/10 dark:bg-purple-500/20 blur-3xl" />
            <div className="absolute bottom-10 right-10 w-80 h-80 rounded-full bg-cyan-500/10 dark:bg-cyan-500/20 blur-3xl" />

            {/* Geometric shapes */}
            <div className="absolute top-20 right-20 w-20 h-20 border border-purple-500/20 dark:border-purple-500/30 rounded-lg rotate-12" />
            <div className="absolute bottom-32 left-20 w-16 h-16 border border-cyan-500/20 dark:border-cyan-500/30 rounded-full" />

            <Card className="mx-auto max-w-md w-full backdrop-blur-sm bg-background/80 border-muted shadow-xl">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold">
                        Sign in
                    </CardTitle>
                    <CardDescription>
                        Enter your credentials to access your account
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <LoginForm />
                    <div className="relative my-4">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-background px-2 text-muted-foreground">
                                Or continue with
                            </span>
                        </div>
                    </div>
                    <Button
                        variant="outline"
                        type="button"
                        className="w-full cursor-pointer"
                        onClick={() =>
                            (window.location.href = `${
                                import.meta.env.VITE_API_BASE_URL ||
                                "http://localhost:3000"
                            }/auth/google`)
                        }
                    >
                        <svg
                            className="mr-2 h-4 w-4"
                            aria-hidden="true"
                            focusable="false"
                            data-prefix="fab"
                            data-icon="google"
                            role="img"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 488 512"
                        >
                            <path
                                fill="currentColor"
                                d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"
                            ></path>
                        </svg>
                        Google
                    </Button>
                </CardContent>
                <CardFooter className="flex flex-col space-y-4">
                    <div className="text-center text-sm">
                        <NavLink
                            to="/forgot-password"
                            className="text-primary hover:underline underline-offset-4"
                        >
                            Forgot your password?
                        </NavLink>
                    </div>
                    <div className="text-center text-sm">
                        Don&apos;t have an account?{" "}
                        <NavLink
                            to="/signup"
                            className="text-primary hover:underline underline-offset-4"
                        >
                            Sign up
                        </NavLink>
                    </div>
                </CardFooter>
            </Card>
        </div>
    );
}
