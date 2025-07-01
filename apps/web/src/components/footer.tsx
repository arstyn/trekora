import Link from 'next/link';
import {
  Plane,
  Facebook,
  Twitter,
  Linkedin,
  Instagram,
  Sparkles,
} from 'lucide-react';

export function Footer() {
  return (
    <footer className="relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4 group">
              <div className="relative">
                <Plane className="h-8 w-8 transition-colors" />
                <Sparkles className="h-3 w-3 absolute -top-2 -right-2 animate-pulse" />
              </div>
              <span className="text-2xl font-bold ">Trekora</span>
            </div>
            <p className="text-muted-foreground mb-6 max-w-md leading-relaxed">
              The complete multi-tenant SaaS platform for travel companies to
              manage packages, bookings, finance, and operations with real-time
              collaboration.
            </p>
            <div className="flex space-x-4">
              <div className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors cursor-pointer group">
                <Facebook className="h-5 w-5 text-muted-foreground group-hover:text-black transition-colors" />
              </div>
              <div className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors cursor-pointer group">
                <Twitter className="h-5 w-5 text-muted-foreground group-hover:text-black transition-colors" />
              </div>
              <div className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors cursor-pointer group">
                <Linkedin className="h-5 w-5 text-muted-foreground group-hover:text-black transition-colors" />
              </div>
              <div className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors cursor-pointer group">
                <Instagram className="h-5 w-5 text-muted-foreground group-hover:text-black transition-colors" />
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Product</h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/features"
                  className="text-muted-foreground hover:text-black transition-colors hover:translate-x-1 inline-block"
                >
                  Features
                </Link>
              </li>
              <li>
                <Link
                  href="/pricing"
                  className="text-muted-foreground hover:text-black transition-colors hover:translate-x-1 inline-block"
                >
                  Pricing
                </Link>
              </li>
              <li>
                <Link
                  href="/integrations"
                  className="text-muted-foreground hover:text-black transition-colors hover:translate-x-1 inline-block"
                >
                  Integrations
                </Link>
              </li>
              <li>
                <Link
                  href="/api"
                  className="text-muted-foreground hover:text-black transition-colors hover:translate-x-1 inline-block"
                >
                  API
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Company</h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/about"
                  className="text-muted-foreground hover:text-black transition-colors hover:translate-x-1 inline-block"
                >
                  About
                </Link>
              </li>
              <li>
                <Link
                  href="/team"
                  className="text-muted-foreground hover:text-black transition-colors hover:translate-x-1 inline-block"
                >
                  Team
                </Link>
              </li>
              <li>
                <Link
                  href="/careers"
                  className="text-muted-foreground hover:text-black transition-colors hover:translate-x-1 inline-block"
                >
                  Careers
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-muted-foreground hover:text-black transition-colors hover:translate-x-1 inline-block"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            © {new Date().getFullYear()} Trekora. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link
              href="/privacy"
              className="text-gray-400 hover:text-black text-sm transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms"
              className="text-gray-400 hover:text-black text-sm transition-colors"
            >
              Terms of Service
            </Link>
            <Link
              href="/cookies"
              className="text-gray-400 hover:text-black text-sm transition-colors"
            >
              Cookie Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
