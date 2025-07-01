import { Button } from '@/components/ui/button';
import { ArrowRight, Play, Star, Zap, Shield, Globe } from 'lucide-react';
import Image from 'next/image';

export function Hero() {
  return (
    <section className="relative overflow-hidden pt-16 pb-20 sm:pt-24 sm:pb-32">
      {/* Decorative shapes */}
      <div className="absolute top-20 left-10 w-64 h-64 rounded-full bg-purple-500/10 dark:bg-purple-500/20 blur-3xl" />
      <div className="absolute bottom-10 right-10 w-80 h-80 rounded-full bg-cyan-500/10 dark:bg-cyan-500/20 blur-3xl" />
      <div className="absolute top-1/3 right-1/4 w-40 h-40 rounded-full bg-pink-500/10 dark:bg-pink-500/20 blur-2xl" />

      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div
          className="absolute -top-4 left-1/4 w-1 h-1 rounded-full bg-purple-400/40 shadow-lg shadow-purple-400/20"
          style={{ boxShadow: '0 0 40px 20px rgba(168, 85, 247, 0.15)' }}
        />
        <div
          className="absolute top-1/3 right-1/3 w-1 h-1 rounded-full bg-cyan-400/40 shadow-lg shadow-cyan-400/20"
          style={{ boxShadow: '0 0 40px 20px rgba(34, 211, 238, 0.15)' }}
        />
        <div
          className="absolute bottom-1/4 left-1/3 w-1 h-1 rounded-full bg-pink-400/40 shadow-lg shadow-pink-400/20"
          style={{ boxShadow: '0 0 40px 20px rgba(244, 114, 182, 0.15)' }}
        />
      </div>

      {/* Geometric shapes */}
      <div className="absolute top-20 right-20 w-20 h-20 border border-purple-500/20 dark:border-purple-500/30 rounded-lg rotate-12" />
      <div className="absolute bottom-32 left-20 w-16 h-16 border border-cyan-500/20 dark:border-cyan-500/30 rounded-full" />
      <div className="absolute top-1/2 left-1/4 w-12 h-12 border border-pink-500/20 dark:border-pink-500/30 rotate-45" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="lg:grid lg:grid-cols-12 lg:gap-8">
          <div className="sm:text-center md:max-w-2xl md:mx-auto lg:col-span-6 lg:text-left">
            {/* Badge */}
            <div className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium mb-6 border border-secondary">
              <Star className="w-4 h-4 mr-2 text-primary" />
              #1 Travel Management Platform
            </div>

            <h1 className="text-4xl font-bold text-foreground tracking-tight sm:text-5xl md:text-6xl">
              Transform Your Travel Business
            </h1>

            <p className="mt-6 text-xl text-muted-foreground leading-8">
              Trekora is the complete multi-tenant SaaS platform that empowers
              travel companies to manage packages, bookings, finance, and
              operations seamlessly. Scale your business with real-time
              collaboration and intelligent automation.
            </p>

            {/* Feature Pills */}
            <div className="mt-6 flex flex-wrap gap-3">
              <div className="inline-flex items-center px-3 py-1 rounded-full border border-secondary text-sm">
                <Zap className="w-3 h-3 mr-1" />
                Real-time Updates
              </div>
              <div className="inline-flex items-center px-3 py-1 rounded-full border border-secondary text-sm">
                <Shield className="w-3 h-3 mr-1" />
                Enterprise Security
              </div>
              <div className="inline-flex items-center px-3 py-1 rounded-full border border-secondary text-sm">
                <Globe className="w-3 h-3 mr-1" />
                Multi-tenant
              </div>
            </div>

            <div className="mt-8 flex flex-col sm:flex-row gap-4 sm:justify-center lg:justify-start">
              <Button
                size="lg"
                className="text-lg px-8 py-3 shadow-lg group cursor-pointer"
              >
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="text-lg px-8 py-3 group cursor-pointer"
              >
                <Play className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                Watch Demo
              </Button>
            </div>

            <div className="mt-8 flex items-center justify-center lg:justify-start space-x-6 text-sm text-muted-foreground">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-primary rounded-full mr-2 animate-pulse"></div>
                <span>14-day free trial</span>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-primary rounded-full mr-2 animate-pulse"></div>
                <span>No credit card required</span>
              </div>
            </div>
          </div>

          <div className="mt-12 relative sm:max-w-lg sm:mx-auto lg:mt-0 lg:max-w-none lg:mx-0 lg:col-span-6 lg:flex lg:items-center">
            <div className="relative mx-auto w-full">
              {/* Main Image Container */}
              <div className="relative bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                <Image
                  src="/placeholder.svg?height=400&width=600"
                  alt="Trekora Dashboard"
                  width={600}
                  height={400}
                  className="w-full rounded-2xl relative z-10"
                />

                {/* Floating Cards */}
                <div className="absolute top-4 right-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-3 border border-gray-200 dark:border-gray-700 animate-bounce">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                      Live Updates
                    </span>
                  </div>
                </div>

                <div className="absolute bottom-4 left-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-3 border border-gray-200 dark:border-gray-700 animate-pulse">
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Bookings Today
                  </div>
                  <div className="text-lg font-bold text-primary">+247</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
