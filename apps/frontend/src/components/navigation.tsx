import { Button } from "@/components/ui/button";
import { LogoIcon } from "@/components/logo";
import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { ThemeToggle } from "./theme-toggle";

export function Navigation() {
	const [isOpen, setIsOpen] = useState(false);
	const location = useLocation();

	useEffect(() => {
		setIsOpen(false);
	}, [location.pathname]);

	return (
		<nav className="relative bg-background shadow-sm border-b top-0 z-50">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="flex justify-between items-center h-16">
					<div className="flex items-center">
						<NavLink to="/" className="flex items-center space-x-2 group">
							<div className="relative">
								<LogoIcon className="h-8 w-8 transition-colors" />
							</div>
							<span className="text-2xl font-bold">Trekora</span>
						</NavLink>
					</div>

					<div className="hidden md:block">
						<div className="ml-10 flex items-baseline space-x-8">
							<NavLink
								to="/"
								className={`text-sm font-medium transition-colors relative group px-3 py-2 ${location.pathname === "/"
									? "text-foreground font-bold"
									: "text-muted-foreground"
									}`}
							>
								Home
								<span className="absolute inset-x-0 bottom-0 h-0.5 bg-secondary scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></span>
							</NavLink>
							<NavLink
								to="/about"
								className={`text-sm font-medium transition-colors relative group px-3 py-2 ${location.pathname === "/about"
									? "text-foreground font-bold"
									: "text-muted-foreground"
									}`}
							>
								About
								<span className="absolute inset-x-0 bottom-0 h-0.5 bg-secondary scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></span>
							</NavLink>
							<NavLink
								to="/pricing"
								className={`text-sm font-medium transition-colors relative group px-3 py-2 ${location.pathname === "/pricing"
									? "text-foreground font-bold"
									: "text-muted-foreground"
									}`}
							>
								Pricing
								<span className="absolute inset-x-0 bottom-0 h-0.5 bg-secondary scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></span>
							</NavLink>
							<NavLink
								to="/team"
								className={`text-sm font-medium transition-colors relative group px-3 py-2 ${location.pathname === "/team"
									? "text-foreground font-bold"
									: "text-muted-foreground"
									}`}
							>
								Team
								<span className="absolute inset-x-0 bottom-0 h-0.5 bg-secondary scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></span>
							</NavLink>
							<NavLink
								to="/contact"
								className={`text-sm font-medium transition-colors relative group px-3 py-2 ${location.pathname === "/contact"
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
							aria-label="Toggle navigation menu"
							className="text-muted-foreground hover:text-foreground p-1 rounded-md"
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
				<>
					{/* Backdrop to close menu on outside click */}
					<div
						className="fixed inset-0 top-16 bg-black/20 backdrop-blur-[2px] z-40 md:hidden"
						onClick={() => setIsOpen(false)}
					/>
					<div className="md:hidden absolute top-full inset-x-0 w-full bg-background/95 backdrop-blur-md border-b shadow-xl z-50 animate-in fade-in-0 slide-in-from-top-2 duration-200 max-h-[calc(100vh-4rem)] overflow-y-auto">
						<div className="px-4 pt-2 pb-4 space-y-1 sm:px-6">
							<NavLink
								to="/"
								onClick={() => setIsOpen(false)}
								className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${location.pathname === "/"
									? "text-foreground font-bold bg-accent/50"
									: "text-muted-foreground hover:text-foreground hover:bg-accent/30"
									}`}
							>
								Home
							</NavLink>
							<NavLink
								to="/about"
								onClick={() => setIsOpen(false)}
								className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${location.pathname === "/about"
									? "text-foreground font-bold bg-accent/50"
									: "text-muted-foreground hover:text-foreground hover:bg-accent/30"
									}`}
							>
								About
							</NavLink>
							<NavLink
								to="/pricing"
								onClick={() => setIsOpen(false)}
								className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${location.pathname === "/pricing"
									? "text-foreground font-bold bg-accent/50"
									: "text-muted-foreground hover:text-foreground hover:bg-accent/30"
									}`}
							>
								Pricing
							</NavLink>
							<NavLink
								to="/team"
								onClick={() => setIsOpen(false)}
								className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${location.pathname === "/team"
									? "text-foreground font-bold bg-accent/50"
									: "text-muted-foreground hover:text-foreground hover:bg-accent/30"
									}`}
							>
								Team
							</NavLink>
							<NavLink
								to="/contact"
								onClick={() => setIsOpen(false)}
								className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${location.pathname === "/contact"
									? "text-foreground font-bold bg-accent/50"
									: "text-muted-foreground hover:text-foreground hover:bg-accent/30"
									}`}
							>
								Contact
							</NavLink>
							<div className="pt-3 mt-2 border-t border-border">
								<div className="grid grid-cols-2 gap-3">
									<Button variant="outline" className="w-full" asChild>
										<NavLink
											to="/login"
											onClick={() => setIsOpen(false)}
										>
											Sign In
										</NavLink>
									</Button>
									<Button className="w-full" asChild>
										<NavLink
											to="/signup"
											onClick={() => setIsOpen(false)}
										>
											Get Started
										</NavLink>
									</Button>
								</div>
							</div>
						</div>
					</div>
				</>
			)}
		</nav>
	);
}
