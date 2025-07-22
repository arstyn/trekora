import { Card, CardContent } from "@/components/ui/card";
import { Linkedin, Twitter } from "lucide-react";
import { NavLink } from "react-router-dom";

export default function Team() {
	const team = [
		{
			name: "Alex Johnson",
			role: "CEO & Co-Founder",
			image: "/placeholder.svg?height=300&width=300",
			bio: "15+ years in travel industry, former VP at major travel corporation. Passionate about transforming travel technology.",
			linkedin: "#",
			twitter: "#",
		},
		{
			name: "Sarah Chen",
			role: "CTO & Co-Founder",
			image: "/placeholder.svg?height=300&width=300",
			bio: "Former senior engineer at Google. Expert in scalable systems and multi-tenant architecture.",
			linkedin: "#",
			twitter: "#",
		},
		{
			name: "Michael Rodriguez",
			role: "VP of Product",
			image: "/placeholder.svg?height=300&width=300",
			bio: "Product leader with 12+ years experience building SaaS platforms for enterprise customers.",
			linkedin: "#",
			twitter: "#",
		},
		{
			name: "Emily Davis",
			role: "VP of Engineering",
			image: "/placeholder.svg?height=300&width=300",
			bio: "Engineering leader focused on building reliable, scalable systems. Former tech lead at Airbnb.",
			linkedin: "#",
			twitter: "#",
		},
		{
			name: "David Kim",
			role: "Head of Sales",
			image: "/placeholder.svg?height=300&width=300",
			bio: "Sales executive with deep understanding of travel industry needs and customer success.",
			linkedin: "#",
			twitter: "#",
		},
		{
			name: "Lisa Thompson",
			role: "Head of Customer Success",
			image: "/placeholder.svg?height=300&width=300",
			bio: "Customer success expert dedicated to ensuring our clients achieve their business goals.",
			linkedin: "#",
			twitter: "#",
		},
	];

	return (
		<div className="relative min-h-screen w-full bg-gradient-to-br from-background to-background/80 overflow-hidden">
			<div className="absolute top-20 left-10 w-64 h-64 rounded-full bg-purple-500/10 dark:bg-purple-500/20 blur-3xl" />
			<div className="absolute bottom-10 right-10 w-80 h-80 rounded-full bg-cyan-500/10 dark:bg-cyan-500/20 blur-3xl" />
			<div className="absolute top-1/3 right-1/4 w-40 h-40 rounded-full bg-pink-500/10 dark:bg-pink-500/20 blur-2xl" />

			{/* Animated background elements */}
			<div className="absolute inset-0 overflow-hidden">
				<div
					className="absolute -top-4 left-1/4 w-1 h-1 rounded-full bg-purple-400/40 shadow-lg shadow-purple-400/20"
					style={{ boxShadow: "0 0 40px 20px rgba(168, 85, 247, 0.15)" }}
				/>
				<div
					className="absolute top-1/3 right-1/3 w-1 h-1 rounded-full bg-cyan-400/40 shadow-lg shadow-cyan-400/20"
					style={{ boxShadow: "0 0 40px 20px rgba(34, 211, 238, 0.15)" }}
				/>
				<div
					className="absolute bottom-1/4 left-1/3 w-1 h-1 rounded-full bg-pink-400/40 shadow-lg shadow-pink-400/20"
					style={{ boxShadow: "0 0 40px 20px rgba(244, 114, 182, 0.15)" }}
				/>
			</div>

			{/* Geometric shapes */}
			<div className="absolute top-20 right-20 w-20 h-20 border border-purple-500/20 dark:border-purple-500/30 rounded-lg rotate-12" />
			<div className="absolute bottom-32 left-20 w-16 h-16 border border-cyan-500/20 dark:border-cyan-500/30 rounded-full" />
			<div className="absolute top-1/2 left-1/4 w-12 h-12 border border-pink-500/20 dark:border-pink-500/30 rotate-45" />
			{/* Hero Section */}
			<section className="py-20">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
					<h1 className="text-4xl font-bold sm:text-5xl">Meet Our Team</h1>
					<p className="mt-6 text-xl text-muted-foreground max-w-3xl mx-auto">
						We're a passionate team of travel industry veterans and technology
						experts committed to revolutionizing how travel companies operate.
					</p>
				</div>
			</section>

			{/* Team Grid */}
			<section className="py-20">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
						{team.map((member, index) => (
							<Card
								key={index}
								className="border-0 shadow-lg hover:shadow-xl transition-shadow"
							>
								<CardContent className="p-8 text-center">
									<img
										src={member.image || "/placeholder.svg"}
										alt={member.name}
										width={300}
										height={300}
										className="w-32 h-32 rounded-full mx-auto mb-6 object-cover"
									/>
									<h3 className="text-xl font-bold mb-2">
										{member.name}
									</h3>
									<p className=" font-medium mb-4">{member.role}</p>
									<p className="text-muted-foreground mb-6">
										{member.bio}
									</p>
									<div className="flex justify-center space-x-4">
										<NavLink
											to={member.linkedin}
											className="text-muted-foreground"
										>
											<Linkedin className="h-5 w-5" />
										</NavLink>
										<NavLink
											to={member.twitter}
											className="text-muted-foreground"
										>
											<Twitter className="h-5 w-5" />
										</NavLink>
									</div>
								</CardContent>
							</Card>
						))}
					</div>
				</div>
			</section>

			{/* Join Us Section */}
			<section className="py-20">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
					<h2 className="text-3xl font-bold sm:text-4xl">Join Our Team</h2>
					<p className="mt-4 text-xl text-muted-foreground max-w-2xl mx-auto">
						We're always looking for talented individuals who share our
						passion for transforming the travel industry.
					</p>
					<div className="mt-8">
						<NavLink
							to="/careers"
							className="inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-md bg-primary text-secondary"
						>
							View Open Positions
						</NavLink>
					</div>
				</div>
			</section>
		</div>
	);
}
