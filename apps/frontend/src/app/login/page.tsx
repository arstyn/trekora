import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { ThemeToggle } from "@/components/theme-toggle";
import { ArrowRight } from "lucide-react";

export default function LoginPage() {
	return (
		<div className="relative min-h-screen w-full bg-gradient-to-br from-background to-background/80 flex items-center justify-center p-4">
			<div className="absolute top-4 right-4 z-50">
				<ThemeToggle />
			</div>
			{/* Decorative elements */}
			<div className="absolute top-20 left-10 w-64 h-64 rounded-full bg-purple-500/10 dark:bg-purple-500/20 blur-3xl" />
			<div className="absolute bottom-10 right-10 w-80 h-80 rounded-full bg-cyan-500/10 dark:bg-cyan-500/20 blur-3xl" />

			{/* Geometric shapes */}
			<div className="absolute top-20 right-20 w-20 h-20 border border-purple-500/20 dark:border-purple-500/30 rounded-lg rotate-12" />
			<div className="absolute bottom-32 left-20 w-16 h-16 border border-cyan-500/20 dark:border-cyan-500/30 rounded-full" />

			<Card className="mx-auto max-w-md w-full backdrop-blur-sm bg-background/80 border-muted shadow-xl">
				<CardHeader className="space-y-1">
					<CardTitle className="text-2xl font-bold">Sign in</CardTitle>
					<CardDescription>
						Enter your credentials to access your account
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="email">Email</Label>
						<Input id="email" type="email" placeholder="name@example.com" />
					</div>
					<div className="space-y-2">
						<div className="flex items-center justify-between">
							<Label htmlFor="password">Password</Label>
							<Link
								href="#"
								className="text-sm text-primary hover:underline underline-offset-4"
							>
								Forgot password?
							</Link>
						</div>
						<Input id="password" type="password" />
					</div>
					<Button type="submit" className="w-full">
						Sign in
					</Button>

					<Button asChild size="lg" className="mt-6 group">
						<Link href="/dashboard">
							Skip to Dashboard
							<ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
						</Link>
					</Button>
				</CardContent>
				<CardFooter className="flex flex-col space-y-4">
					<div className="text-center text-sm">
						Don&apos;t have an account?{" "}
						<Link
							href="#"
							className="text-primary hover:underline underline-offset-4"
						>
							Sign up
						</Link>
					</div>
				</CardFooter>
			</Card>
		</div>
	);
}
