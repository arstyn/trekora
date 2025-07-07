import { CTA } from '@/components/cta';
import { Features } from '@/components/features';
import { Hero } from '@/components/hero';
import { Footer } from '@/components/footer';
import { Navigation } from '@/components/navigation';
import { Stats } from '@/components/stats';
import { Testimonials } from '@/components/testimonials';

export default function Home() {
  return (
    <main>
      <Navigation />
      <Hero />
      <Stats />
      <Features />
      <Testimonials />
      <CTA />
      <Footer />
    </main>
  );
}
