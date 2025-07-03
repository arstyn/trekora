'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';
import { Menu, X, Plane, Sparkles } from 'lucide-react';
import { usePathname } from 'next/navigation';

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  return (
    <nav className="bg-background/80 backdrop-blur-md shadow-sm border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2 group">
              <div className="relative">
                <Plane className="h-8 w-8 transition-colors" />
                <Sparkles className="h-3 w-3 absolute -top-2 -right-2 animate-pulse" />
              </div>
              <span className="text-2xl font-bold">Trekora</span>
            </Link>
          </div>

          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              <Link
                href="/"
                className={`text-sm font-medium transition-colors relative group px-3 py-2 ${pathname === '/' ? 'text-foreground font-bold' : 'text-muted-foreground'}`}
              >
                Home
                <span className="absolute inset-x-0 bottom-0 h-0.5 bg-secondary scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></span>
              </Link>
              <Link
                href="/about"
                className={`text-sm font-medium transition-colors relative group px-3 py-2 ${pathname === '/about' ? 'text-foreground font-bold' : 'text-muted-foreground'}`}
              >
                About
                <span className="absolute inset-x-0 bottom-0 h-0.5 bg-secondary scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></span>
              </Link>
              <Link
                href="/pricing"
                className={`text-sm font-medium transition-colors relative group px-3 py-2 ${pathname === '/pricing' ? 'text-foreground font-bold' : 'text-muted-foreground'}`}
              >
                Pricing
                <span className="absolute inset-x-0 bottom-0 h-0.5 bg-secondary scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></span>
              </Link>
              <Link
                href="/team"
                className={`text-sm font-medium transition-colors relative group px-3 py-2 ${pathname === '/team' ? 'text-foreground font-bold' : 'text-muted-foreground'}`}
              >
                Team
                <span className="absolute inset-x-0 bottom-0 h-0.5 bg-secondary scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></span>
              </Link>
              <Link
                href="/contact"
                className={`text-sm font-medium transition-colors relative group px-3 py-2 ${pathname === '/contact' ? 'text-foreground font-bold' : 'text-muted-foreground'}`}
              >
                Contact
                <span className="absolute inset-x-0 bottom-0 h-0.5 bg-secondary scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></span>
              </Link>
            </div>
          </div>

          <div className="hidden md:block">
            <div className="ml-4 flex items-center space-x-4">
              <ThemeToggle />
              <Link
                href="/login"
                className="cursor-pointer text-sm font-semibold px-4 py-2 rounded-md hover:bg-accent dark:hover:bg-accent/50"
              >
                Log In
              </Link>
              <Link
                href="/signup"
                className="cursor-pointer text-sm font-semibold px-4 py-2 rounded-md bg-primary text-secondary"
              >
                Get Started
              </Link>
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
            <Link
              href="/"
              className={`block px-3 py-2 text-base font-medium ${pathname === '/' ? 'text-foreground font-bold' : 'text-muted-foreground'}`}
            >
              Home
            </Link>
            <Link
              href="/about"
              className={`block px-3 py-2 text-base font-medium ${pathname === '/about' ? 'text-foreground font-bold' : 'text-muted-foreground'}`}
            >
              About
            </Link>
            <Link
              href="/pricing"
              className={`block px-3 py-2 text-base font-medium ${pathname === '/pricing' ? 'text-foreground font-bold' : 'text-muted-foreground'}`}
            >
              Pricing
            </Link>
            <Link
              href="/team"
              className={`block px-3 py-2 text-base font-medium ${pathname === '/team' ? 'text-foreground font-bold' : 'text-muted-foreground'}`}
            >
              Team
            </Link>
            <Link
              href="/contact"
              className={`block px-3 py-2 text-base font-medium ${pathname === '/contact' ? 'text-foreground font-bold' : 'text-muted-foreground'}`}
            >
              Contact
            </Link>
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
