import { Button } from "@/components/ui/button";
import { Menu, Plane, Sparkles, X } from "lucide-react";
import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { ThemeToggle } from "./theme-toggle";

export function Navigation() {
	const [isOpen, setIsOpen] = useState(false);
	const location = useLocation();

	return (
		<nav className="bg-background/80 backdrop-blur-md shadow-sm border-b sticky top-0 z-50">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="flex justify-between items-center h-16">
					<div className="flex items-center">
						<NavLink to="/" className="flex items-center space-x-2 group">
							<div className="relative">
								<Plane className="h-8 w-8 transition-colors" />
								<Sparkles className="h-3 w-3 absolute -top-2 -right-2 animate-pulse" />
							</div>
							<span className="text-2xl font-bold">Trekora</span>
						</NavLink>
					</div>

					<div className="hidden md:block">
						<div className="ml-10 flex items-baseline space-x-8">
							<NavLink
								to="/"
								className={`text-sm font-medium transition-colors relative group px-3 py-2 ${
									location.pathname === "/"
										? "text-foreground font-bold"
										: "text-muted-foreground"
								}`}
							>
								Home
								<span className="absolute inset-x-0 bottom-0 h-0.5 bg-secondary scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></span>
							</NavLink>
							<NavLink
								to="/about"
								className={`text-sm font-medium transition-colors relative group px-3 py-2 ${
									location.pathname === "/about"
										? "text-foreground font-bold"
										: "text-muted-foreground"
								}`}
							>
								About
								<span className="absolute inset-x-0 bottom-0 h-0.5 bg-secondary scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></span>
							</NavLink>
							<NavLink
								to="/pricing"
								className={`text-sm font-medium transition-colors relative group px-3 py-2 ${
									location.pathname === "/pricing"
										? "text-foreground font-bold"
										: "text-muted-foreground"
								}`}
							>
								Pricing
								<span className="absolute inset-x-0 bottom-0 h-0.5 bg-secondary scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></span>
							</NavLink>
							<NavLink
								to="/team"
								className={`text-sm font-medium transition-colors relative group px-3 py-2 ${
									location.pathname === "/team"
										? "text-foreground font-bold"
										: "text-muted-foreground"
								}`}
							>
								Team
								<span className="absolute inset-x-0 bottom-0 h-0.5 bg-secondary scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></span>
							</NavLink>
							<NavLink
								to="/contact"
								className={`text-sm font-medium transition-colors relative group px-3 py-2 ${
									location.pathname === "/contact"
										? "text-foreground font-bold"
										: "text-muted-foreground"
								}`}
							>
								Contact
								<span className="absolute inset-x-0 bottom-0 h-0.5 bg-secondary scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></span>
							</NavLink>
						</div>
					</div>

					<div className="hidden md:block">
						<div className="ml-4 flex items-center space-x-4">
							<ThemeToggle />
							<NavLink
								to="/login"
								className="cursor-pointer text-sm font-semibold px-4 py-2 rounded-md hover:bg-accent dark:hover:bg-accent/50"
							>
								Log In
							</NavLink>
							<NavLink
								to="/signup"
								className="cursor-pointer text-sm font-semibold px-4 py-2 rounded-md bg-primary text-secondary"
							>
								Get Started
							</NavLink>
						</div>
					</div>

					<div className="md:hidden flex items-center space-x-2">
						<ThemeToggle />
						<button
							onClick={() => setIsOpen(!isOpen)}
							className="text-muted-foreground hover:text-foreground"
						>
							{isOpen ? (
								<X className="h-6 w-6" />
							) : (
								<Menu className="h-6 w-6" />
							)}
						</button>
					</div>
				</div>
			</div>

			{isOpen && (
				<div className="md:hidden">
					<div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-background/95 backdrop-blur-md border-t">
						<NavLink
							to="/"
							className={`block px-3 py-2 text-base font-medium ${
								location.pathname === "/"
									? "text-foreground font-bold"
									: "text-muted-foreground"
							}`}
						>
							Home
						</NavLink>
						<NavLink
							to="/about"
							className={`block px-3 py-2 text-base font-medium ${
								location.pathname === "/about"
									? "text-foreground font-bold"
									: "text-muted-foreground"
							}`}
						>
							About
						</NavLink>
						<NavLink
							to="/pricing"
							className={`block px-3 py-2 text-base font-medium ${
								location.pathname === "/pricing"
									? "text-foreground font-bold"
									: "text-muted-foreground"
							}`}
						>
							Pricing
						</NavLink>
						<NavLink
							to="/team"
							className={`block px-3 py-2 text-base font-medium ${
								location.pathname === "/team"
									? "text-foreground font-bold"
									: "text-muted-foreground"
							}`}
						>
							Team
						</NavLink>
						<NavLink
							to="/contact"
							className={`block px-3 py-2 text-base font-medium ${
								location.pathname === "/contact"
									? "text-foreground font-bold"
									: "text-muted-foreground"
							}`}
						>
							Contact
						</NavLink>
						<div className="pt-4 pb-3 border-t border-border">
							<div className="flex items-center px-3 space-x-3">
								<Button variant="ghost" className="w-full">
									Sign In
								</Button>
								<Button className="w-full">Get Started</Button>
							</div>
						</div>
					</div>
				</div>
			)}
		</nav>
	);
}
