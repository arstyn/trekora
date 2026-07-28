import { useState } from "react";
import { WifiOff, RefreshCw, HelpCircle, ChevronDown, ChevronUp, Terminal } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ServerErrorPageProps {
	onRetry: () => Promise<void> | void;
}

export default function ServerErrorPage({ onRetry }: ServerErrorPageProps) {
	const [isRetrying, setIsRetrying] = useState(false);
	const [showDiagnostics, setShowDiagnostics] = useState(false);

	const handleRetry = async () => {
		setIsRetrying(true);
		// Let the spinner show for at least 800ms for a better UX feedback loop
		const startTime = Date.now();
		try {
			await onRetry();
		} catch (err) {
			console.error("Retry failed:", err);
		} finally {
			const elapsedTime = Date.now() - startTime;
			const remainingTime = Math.max(0, 800 - elapsedTime);
			setTimeout(() => {
				setIsRetrying(false);
			}, remainingTime);
		}
	};

	const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";

	return (
		<div className="min-h-screen w-full flex items-center justify-center bg-background relative overflow-hidden px-4 py-12">
			{/* Animated Background Gradients */}
			<div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-destructive/10 rounded-full blur-[100px] pointer-events-none animate-pulse" />
			<div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

			{/* Center Card */}
			<div className="relative w-full max-w-lg bg-card/65 backdrop-blur-xl border border-border/80 shadow-2xl rounded-2xl p-8 md:p-10 text-center z-10 transition-all duration-300 hover:border-border">

				{/* Pulsing Disconnected Icon Container */}
				<div className="relative inline-flex items-center justify-center p-6 bg-destructive/10 rounded-full text-destructive mb-6 ring-8 ring-destructive/5 animate-pulse">
					<WifiOff className="h-10 w-10" />
					<div className="absolute inset-0 rounded-full border border-destructive/30 animate-ping opacity-45" />
				</div>

				<h1 className="text-3xl font-extrabold tracking-tight text-foreground mb-3">
					Connection Lost
				</h1>

				<p className="text-muted-foreground text-sm leading-relaxed mb-8 max-w-md mx-auto">
					We couldn't establish a connection to the Trekora backend servers. Please retry later.
				</p>

				{/* Quick Actions */}
				<div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-8">
					<Button
						onClick={handleRetry}
						disabled={isRetrying}
						className="w-full sm:w-auto px-6 py-2 h-11 flex items-center justify-center gap-2 text-sm font-semibold rounded-lg shadow-lg shadow-primary/10 transition-all duration-200 cursor-pointer active:scale-[0.98]"
					>
						<RefreshCw className={`h-4 w-4 ${isRetrying ? "animate-spin" : ""}`} />
						{isRetrying ? "Checking connection..." : "Retry Connection"}
					</Button>
				</div>

				{/* Troubleshooting Tips */}
				<div className="text-left bg-muted/40 border border-border/40 rounded-xl p-5 mb-6">
					<h3 className="flex items-center gap-2 text-sm font-semibold text-foreground mb-3">
						<HelpCircle className="h-4 w-4 text-primary" />
						Troubleshooting Steps
					</h3>
					<ul className="space-y-2.5 text-xs text-muted-foreground">
						<li className="flex items-start gap-2">
							<span className="flex-shrink-0 flex items-center justify-center w-5 h-5 rounded-full bg-border text-[10px] font-bold text-foreground mt-0.5">1</span>
							<span>Ensure the backend server is running via <code className="bg-muted px-1.5 py-0.5 rounded border border-border/50 text-[11px] font-mono">npm run dev</code> inside <code className="bg-muted px-1.5 py-0.5 rounded border border-border/50 text-[11px] font-mono">apps/backend</code>.</span>
						</li>
						<li className="flex items-start gap-2">
							<span className="flex-shrink-0 flex items-center justify-center w-5 h-5 rounded-full bg-border text-[10px] font-bold text-foreground mt-0.5">2</span>
							<span>Verify that your internet connection is active.</span>
						</li>
						<li className="flex items-start gap-2">
							<span className="flex-shrink-0 flex items-center justify-center w-5 h-5 rounded-full bg-border text-[10px] font-bold text-foreground mt-0.5">3</span>
							<span>Verify that backend port matches your configuration settings.</span>
						</li>
					</ul>
				</div>

				{/* Diagnostics Drawer (Collapsible) */}
				<div className="border border-border/40 rounded-lg overflow-hidden">
					<button
						onClick={() => setShowDiagnostics(!showDiagnostics)}
						className="w-full flex items-center justify-between px-4 py-3 bg-muted/20 hover:bg-muted/40 transition-colors text-xs font-semibold text-muted-foreground cursor-pointer"
					>
						<span className="flex items-center gap-2">
							<Terminal className="h-3.5 w-3.5" />
							Diagnostic Details
						</span>
						{showDiagnostics ? (
							<ChevronUp className="h-4 w-4" />
						) : (
							<ChevronDown className="h-4 w-4" />
						)}
					</button>

					{showDiagnostics && (
						<div className="px-4 py-3 bg-muted/10 border-t border-border/40 text-left text-xs font-mono text-muted-foreground space-y-1.5 overflow-x-auto">
							<div>
								<span className="text-primary font-semibold">API BASE URL:</span>{" "}
								<span className="text-foreground selection:bg-primary/20">{apiBaseUrl}</span>
							</div>
							<div>
								<span className="text-primary font-semibold">STATUS:</span>{" "}
								<span className="text-destructive font-semibold">UNREACHABLE</span>
							</div>
							<div>
								<span className="text-primary font-semibold">LOCAL TIME:</span>{" "}
								<span>{new Date().toISOString()}</span>
							</div>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
