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

// export default function Home() {
//   return (
//     <div className="relative min-h-screen w-full bg-gradient-to-br from-background to-background/80 flex items-center justify-center overflow-hidden">
//       <div className="absolute top-4 right-4 z-50">
//         <ThemeToggle />
//       </div>

//       {/* Decorative shapes */}
//       <div className="absolute top-20 left-10 w-64 h-64 rounded-full bg-purple-500/10 dark:bg-purple-500/20 blur-3xl" />
//       <div className="absolute bottom-10 right-10 w-80 h-80 rounded-full bg-cyan-500/10 dark:bg-cyan-500/20 blur-3xl" />
//       <div className="absolute top-1/3 right-1/4 w-40 h-40 rounded-full bg-pink-500/10 dark:bg-pink-500/20 blur-2xl" />

//       {/* Animated background elements */}
//       <div className="absolute inset-0 overflow-hidden">
//         <div
//           className="absolute -top-4 left-1/4 w-1 h-1 rounded-full bg-purple-400/40 shadow-lg shadow-purple-400/20"
//           style={{ boxShadow: '0 0 40px 20px rgba(168, 85, 247, 0.15)' }}
//         />
//         <div
//           className="absolute top-1/3 right-1/3 w-1 h-1 rounded-full bg-cyan-400/40 shadow-lg shadow-cyan-400/20"
//           style={{ boxShadow: '0 0 40px 20px rgba(34, 211, 238, 0.15)' }}
//         />
//         <div
//           className="absolute bottom-1/4 left-1/3 w-1 h-1 rounded-full bg-pink-400/40 shadow-lg shadow-pink-400/20"
//           style={{ boxShadow: '0 0 40px 20px rgba(244, 114, 182, 0.15)' }}
//         />
//       </div>

//       {/* Geometric shapes */}
//       <div className="absolute top-20 right-20 w-20 h-20 border border-purple-500/20 dark:border-purple-500/30 rounded-lg rotate-12" />
//       <div className="absolute bottom-32 left-20 w-16 h-16 border border-cyan-500/20 dark:border-cyan-500/30 rounded-full" />
//       <div className="absolute top-1/2 left-1/4 w-12 h-12 border border-pink-500/20 dark:border-pink-500/30 rotate-45" />

//       <div className="relative z-10 max-w-md mx-auto p-8 rounded-xl bg-background/80 backdrop-blur-sm border border-muted shadow-xl">
//         <div className="space-y-6 text-center">
//           <div className="space-y-2">
//             <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
//               Under Development
//             </h1>
//             <p className="text-muted-foreground md:text-xl">
//               Our home page is currently being built. Please proceed to the
//               login page for now.
//             </p>
//           </div>

//           <div className="relative h-1 w-full bg-muted overflow-hidden rounded-full">
//             <div className="absolute h-full w-2/3 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full animate-pulse" />
//           </div>

//           <Button asChild size="lg" className="mt-6 group">
//             <Link href="/login">
//               Proceed to Login
//               <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
//             </Link>
//           </Button>
//         </div>
//       </div>
//     </div>
//   );
// }
