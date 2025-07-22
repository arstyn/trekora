import { TrendingUp, Users, Clock, Headphones } from 'lucide-react';

export function Stats() {
  const stats = [
    {
      number: '500+',
      label: 'Travel Companies',
      icon: Users,
      color: 'from-blue-500 to-indigo-500',
    },
    {
      number: '1M+',
      label: 'Bookings Processed',
      icon: TrendingUp,
      color: 'from-indigo-500 to-purple-500',
    },
    {
      number: '99.9%',
      label: 'Uptime Guarantee',
      icon: Clock,
      color: 'from-cyan-500 to-blue-500',
    },
    {
      number: '24/7',
      label: 'Customer Support',
      icon: Headphones,
      color: 'from-blue-500 to-indigo-500',
    },
  ];

  return (
    <section className="relative py-16 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-black/10"></div>
      <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {stats.map((stat, index) => (
            <div key={index} className="text-center group">
              <div className="relative mb-4">
                <div
                  className={`w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br ${stat.color} p-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}
                >
                  <stat.icon className="w-8 h-8" />
                </div>
                <div className="absolute inset-0 w-16 h-16 mx-auto rounded-2xl bg-white/20 blur-xl group-hover:bg-white/30 transition-colors"></div>
              </div>
              <div className="text-3xl md:text-4xl font-bold mb-2 group-hover:scale-105 transition-transform">
                {stat.number}
              </div>
              <div className="text-muted-foreground text-sm md:text-base font-medium">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
