import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MapPin, Phone, Mail, Clock } from "lucide-react";

export default function Contact() {
	return (
		<div className="relative min-h-screen w-full bg-gradient-to-br from-background to-background/80 overflow-hidden">
			{/* Decorative shapes */}
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

			{/* Hero Section */}
			<section className="py-20">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
					<h1 className="text-4xl font-bold sm:text-5xl">Get in Touch</h1>
					<p className="mt-6 text-xl text-muted-foreground max-w-3xl mx-auto">
						Ready to transform your travel business? We'd love to hear from
						you. Get in touch and let's discuss how Trekora can help you grow.
					</p>
				</div>
			</section>

			{/* Contact Form & Info */}
			<section className="py-20">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
						{/* Contact Form */}
						<Card className="border-0 shadow-lg">
							<CardHeader>
								<CardTitle className="text-2xl">
									Send us a message
								</CardTitle>
							</CardHeader>
							<CardContent className="space-y-6">
								<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
									<div>
										<label
											htmlFor="firstName"
											className="block text-sm font-medium text-muted-foreground mb-2"
										>
											First Name
										</label>
										<Input id="firstName" placeholder="John" />
									</div>
									<div>
										<label
											htmlFor="lastName"
											className="block text-sm font-medium text-muted-foreground mb-2"
										>
											Last Name
										</label>
										<Input id="lastName" placeholder="Doe" />
									</div>
								</div>
								<div>
									<label
										htmlFor="email"
										className="block text-sm font-medium text-muted-foreground mb-2"
									>
										Email
									</label>
									<Input
										id="email"
										type="email"
										placeholder="john@example.com"
									/>
								</div>
								<div>
									<label
										htmlFor="company"
										className="block text-sm font-medium text-muted-foreground mb-2"
									>
										Company
									</label>
									<Input
										id="company"
										placeholder="Your Travel Company"
									/>
								</div>
								<div>
									<label
										htmlFor="message"
										className="block text-sm font-medium text-muted-foreground mb-2"
									>
										Message
									</label>
									<Textarea
										id="message"
										rows={6}
										placeholder="Tell us about your travel business and how we can help..."
									/>
								</div>
								<Button className="w-full cursor-pointer" size="lg">
									Send Message
								</Button>
							</CardContent>
						</Card>

						{/* Contact Information */}
						<div className="space-y-8">
							<div>
								<h2 className="text-2xl font-bold mb-6">
									Contact Information
								</h2>
								<p className="text-muted-foreground mb-8">
									We're here to help you succeed. Reach out to us
									through any of the following channels.
								</p>
							</div>

							<div className="space-y-6">
								<div className="flex items-start space-x-4">
									<div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
										<MapPin className="h-6 w-6 text-secondary" />
									</div>
									<div>
										<h3 className="font-semibold">Address</h3>
										<p className="text-muted-foreground">
											123 Business District
											<br />
											San Francisco, CA 94105
											<br />
											United States
										</p>
									</div>
								</div>

								<div className="flex items-start space-x-4">
									<div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
										<Phone className="h-6 w-6 text-secondary" />
									</div>
									<div>
										<h3 className="font-semibold">Phone</h3>
										<p className="text-muted-foreground">
											+1 (555) 123-4567
										</p>
									</div>
								</div>

								<div className="flex items-start space-x-4">
									<div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
										<Mail className="h-6 w-6 text-secondary" />
									</div>
									<div>
										<h3 className="font-semibold">Email</h3>
										<p className="text-muted-foreground">
											hello@trekora.com
										</p>
									</div>
								</div>

								<div className="flex items-start space-x-4">
									<div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
										<Clock className="h-6 w-6 text-secondary" />
									</div>
									<div>
										<h3 className="font-semibold">Business Hours</h3>
										<p className="text-muted-foreground">
											Monday - Friday: 9:00 AM - 6:00 PM PST
											<br />
											Saturday - Sunday: Closed
										</p>
									</div>
								</div>
							</div>

							<Card className="border-primary bg-primary">
								<CardContent className="p-6">
									<h3 className="font-semibold text-secondary mb-2">
										Need immediate assistance?
									</h3>
									<p className="text-secondary mb-4">
										For urgent technical support or sales inquiries,
										you can reach us 24/7.
									</p>
									<Button
										variant="secondary"
										className="cursor-pointer"
									>
										Emergency Support
									</Button>
								</CardContent>
							</Card>
						</div>
					</div>
				</div>
			</section>
		</div>
	);
}
