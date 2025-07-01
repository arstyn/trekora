import { Card, CardContent } from '@/components/ui/card';
import { Star, Quote } from 'lucide-react';
import Image from 'next/image';

export function Testimonials() {
  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'CEO, Wanderlust Travel',
      image: '/placeholder.svg?height=60&width=60',
      content:
        "Trekora transformed our operations completely. We've increased our booking efficiency by 300% and our customers love the seamless experience.",
      rating: 5,
      gradient: 'from-blue-500 to-indigo-500',
    },
    {
      name: 'Michael Chen',
      role: 'Operations Manager, Global Adventures',
      image: '/placeholder.svg?height=60&width=60',
      content:
        'The multi-branch support and real-time collaboration features have been game-changers for our expanding business. Highly recommended!',
      rating: 5,
      gradient: 'from-indigo-500 to-purple-500',
    },
    {
      name: 'Emily Rodriguez',
      role: 'Finance Director, Dream Destinations',
      image: '/placeholder.svg?height=60&width=60',
      content:
        'The finance management and reporting capabilities are outstanding. We now have complete visibility into our financial operations.',
      rating: 5,
      gradient: 'from-purple-500 to-blue-500',
    },
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-background to-muted/30 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      <div className="absolute top-20 right-20 w-64 h-64 bg-emerald-200 dark:bg-emerald-800 rounded-full blur-3xl opacity-20"></div>
      <div className="absolute bottom-20 left-20 w-80 h-80 bg-teal-200 dark:bg-teal-800 rounded-full blur-3xl opacity-20"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center">
          <div className="inline-flex items-center px-4 py-2 rounded-full border border-secondary text-sm font-medium mb-6">
            💬 Customer Stories
          </div>
          <h2 className="text-3xl font-bold text-foreground sm:text-4xl mb-4">
            Trusted by Travel Companies Worldwide
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            See what our customers have to say about their experience with
            Trekora
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-8 lg:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <Card
              key={index}
              className="group border-0 shadow-lg hover:shadow-2xl transition-all duration-300 bg-gradient-to-br from-background to-background/50 backdrop-blur-sm hover:scale-105 overflow-hidden relative"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-indigo-50/50 dark:from-blue-950/50 dark:to-indigo-950/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <CardContent className="p-8 relative">
                {/* Quote Icon */}
                <div className="absolute top-4 right-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Quote className="h-12 w-12 text-blue-600" />
                </div>

                {/* Stars */}
                <div className="flex items-center mb-6">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star
                      key={i}
                      className="h-5 w-5 text-yellow-400 fill-current"
                    />
                  ))}
                </div>

                {/* Content */}
                <p className="text-muted-foreground mb-8 italic text-lg leading-relaxed relative z-10">
                  "{testimonial.content}"
                </p>

                {/* Author */}
                <div className="flex items-center relative z-10">
                  <div className="relative">
                    <Image
                      src={testimonial.image || '/placeholder.svg'}
                      alt={testimonial.name}
                      width={60}
                      height={60}
                      className="rounded-full mr-4 ring-4 ring-white dark:ring-gray-800 shadow-lg"
                    />
                    <div
                      className={`absolute inset-0 rounded-full bg-gradient-to-br ${testimonial.gradient} opacity-20 blur-lg`}
                    ></div>
                  </div>
                  <div>
                    <div className="font-semibold text-foreground text-lg">
                      {testimonial.name}
                    </div>
                    <div className="text-muted-foreground text-sm">
                      {testimonial.role}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
