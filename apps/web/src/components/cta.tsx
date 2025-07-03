import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles, Zap } from 'lucide-react';

export function CTA() {
  return (
    <section className="relative py-20 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-black/10"></div>
      <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>

      {/* Floating Elements */}
      <div className="absolute top-10 left-10 w-32 h-32 bg-white/10 rounded-full blur-2xl animate-pulse"></div>
      <div className="absolute bottom-10 right-10 w-48 h-48 bg-white/10 rounded-full blur-2xl animate-pulse delay-1000"></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
        {/* Badge */}
        <div className="inline-flex items-center px-4 py-2 rounded-full border border-secondary text-sm font-medium mb-6">
          <Sparkles className="w-4 h-4 mr-2" />
          Join 500+ Travel Companies
        </div>

        <h2 className="text-3xl font-bold text-white sm:text-4xl mb-6">
          Ready to Transform Your Travel Business?
        </h2>
        <p className="text-xl text-blue-100 max-w-2xl mx-auto mb-8 leading-relaxed">
          Join hundreds of travel companies already using Trekora to streamline
          their operations and boost growth.
        </p>

        {/* Feature Pills */}
        <div className="flex flex-wrap justify-center gap-4 mb-8">
          <div className="inline-flex items-center px-4 py-2 rounded-full border border-secondary text-sm">
            <Zap className="w-3 h-3 mr-2" />
            Setup in 5 minutes
          </div>
          <div className="inline-flex items-center px-4 py-2 rounded-full border border-secondary text-sm">
            ✨ No credit card required
          </div>
          <div className="inline-flex items-center px-4 py-2 rounded-full border border-secondary text-sm">
            🚀 14-day free trial
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            size="lg"
            className="text-lg px-8 py-3 shadow-xl hover:shadow-2xl cursor-pointer group"
          >
            Start Free Trial
            <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="border-2 border-white text-white hover:bg-white cursor-pointer text-lg px-8 py-3 bg-transparent backdrop-blur-sm transition-all group"
          >
            <Sparkles className="mr-2 h-5 w-5 group-hover:rotate-12 transition-transform" />
            Schedule Demo
          </Button>
        </div>
      </div>
    </section>
  );
}
