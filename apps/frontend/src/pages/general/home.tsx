import { CTA } from "@/components/home/cta";
import { Features } from "@/components/home/features";
import { Hero } from "@/components/home/hero";
import { Stats } from "@/components/home/stats";
import { Testimonials } from "@/components/home/testimonials";

export function Home() {
	return (
		<main>
			<Hero />
			<Stats />
			<Features />
			<Testimonials />
			<CTA />
		</main>
	);
}
