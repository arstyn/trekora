import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileQuestion, ArrowLeft, Home } from "lucide-react";
import { NavLink } from "react-router-dom";

export default function NotFoundPage() {
	return (
		<div className="flex flex-col items-center justify-center min-h-[75vh] p-4 text-center">
			<Card className="w-full max-w-md border shadow-lg backdrop-blur-sm bg-card/90">
				<CardHeader className="space-y-2">
					<div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-2">
						<FileQuestion className="w-8 h-8 text-muted-foreground" />
					</div>
					<span className="text-sm font-semibold uppercase tracking-wider text-primary">404 Error</span>
					<CardTitle className="text-2xl font-bold">Page Not Found</CardTitle>
					<CardDescription>
						The page you are looking for doesn't exist or may have been moved.
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-3 pt-2">
					<Button asChild className="w-full gap-2">
						<NavLink to="/">
							<Home className="w-4 h-4" /> Go to Dashboard
						</NavLink>
					</Button>
					<Button asChild variant="outline" className="w-full gap-2" onClick={() => window.history.back()}>
						<button type="button" className="w-full flex items-center justify-center gap-2">
							<ArrowLeft className="w-4 h-4" /> Go Back
						</button>
					</Button>
				</CardContent>
			</Card>
		</div>
	);
}
