import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Package,
  Users,
  DollarSign,
  Settings,
  MessageSquare,
  BarChart3,
  Building2,
  FileText,
  Bell,
  Monitor,
  RefreshCw,
  Shield,
  ArrowRight,
  Zap,
  Target,
} from 'lucide-react';

export function Features() {
  const coreFeatures = [
    {
      icon: Package,
      title: 'Package Management',
      description:
        'Create and manage comprehensive travel packages including flights, trains, vehicles, and accommodations with ease.',
      gradient: 'from-blue-500 to-indigo-500',
    },
    {
      icon: Users,
      title: 'Sales Workflow',
      description:
        'Streamlined process from enquiry to reservation: Lead generation → Confirmation → Payment → Booking completion.',
      gradient: 'from-indigo-500 to-purple-500',
    },
    {
      icon: DollarSign,
      title: 'Finance Management',
      description:
        'Track payments, refunds, invoices, and financial reports with complete transparency and control.',
      gradient: 'from-purple-500 to-pink-500',
    },
    {
      icon: Settings,
      title: 'Traveler Management',
      description:
        'Customer loyalty programs with Silver, Gold, Platinum badges, referral tracking, and engagement tools.',
      gradient: 'from-pink-500 to-rose-500',
    },
  ];

  const operationsFeatures = [
    {
      icon: MessageSquare,
      title: 'Operations Management',
      description:
        'Handle ticketing, food arrangements, accommodation booking, and visa management in one platform.',
    },
    {
      icon: Building2,
      title: 'Multi-Branch Support',
      description:
        'Manage multiple branches with centralized control and localized operations for scalable growth.',
    },
    {
      icon: FileText,
      title: 'Departmental Collaboration',
      description:
        'Seamless collaboration across Sales, Operations, Accounts, Marketing, and HR departments.',
    },
    {
      icon: Bell,
      title: 'Smart Notifications',
      description:
        'WhatsApp, Email, and SMS alerts for bookings, payments, and important updates to keep everyone informed.',
    },
  ];

  const analyticsFeatures = [
    {
      icon: BarChart3,
      title: 'Advanced Reports',
      description:
        'Export comprehensive data as PDF, Excel, or CSV with customizable reporting and analytics.',
      stats: '50+ Report Types',
    },
    {
      icon: Monitor,
      title: 'Real-time Dashboards',
      description:
        'Live updates for all activities with interactive dashboards for different departments and roles.',
      stats: 'Live Updates',
    },
    {
      icon: RefreshCw,
      title: 'Cancellation & Refunds',
      description:
        'Transparent and controlled refund workflow with automated processing and customer communication.',
      stats: 'Automated Process',
    },
    {
      icon: Shield,
      title: 'Enterprise Security',
      description:
        'Multi-tenant architecture with enterprise-grade security, data isolation, and compliance features.',
      stats: '99.9% Secure',
    },
  ];

  return (
    <section className="py-20 relative">
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Header */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center px-4 py-2 rounded-full border border-secondary text-sm font-medium mb-6">
            ✨ Complete Feature Suite
          </div>
          <h2 className="text-3xl font-bold text-foreground sm:text-4xl mb-4">
            Everything You Need to Run Your Travel Business
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Trekora provides a comprehensive suite of tools designed
            specifically for travel companies to streamline operations and boost
            growth.
          </p>
        </div>

        {/* Core Management Features - Card Grid */}
        <div className="mb-20">
          <div className="flex items-center mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center mr-4">
              <Target className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-foreground">
                Core Management
              </h3>
              <p className="text-muted-foreground">
                Essential tools for managing your travel business
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {coreFeatures.map((feature, index) => (
              <Card
                key={index}
                className="group border shadow-lg hover:shadow-2xl transition-all duration-300 bg-gradient-to-br from-background to-background/50 backdrop-blur-sm hover:scale-105 overflow-hidden relative"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-indigo-50/50 dark:from-blue-950/50 dark:to-indigo-950/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <CardHeader className="relative pb-4">
                  <div className="relative mb-4">
                    <div
                      className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.gradient} p-3 shadow-lg group-hover:scale-110 transition-transform duration-300`}
                    >
                      <feature.icon className="h-8 w-8 text-white" />
                    </div>
                    <div className="absolute inset-0 w-14 h-14 rounded-2xl bg-gradient-to-br from-white/20 to-white/5 blur-xl group-hover:from-white/30 group-hover:to-white/10 transition-colors"></div>
                  </div>
                  <CardTitle className="text-lg group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="relative pt-0">
                  <CardDescription className="text-muted-foreground text-sm leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Operations Features - List Layout */}
        <div className="mb-20">
          <div className="flex items-center mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center mr-4">
              <Zap className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-foreground">
                Operations & Collaboration
              </h3>
              <p className="text-muted-foreground">
                Streamline operations and enhance team collaboration
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {operationsFeatures.map((feature, index) => (
              <div
                key={index}
                className="group flex items-start space-x-6 p-6 bg-gradient-to-br from-background to-background/50 backdrop-blur-sm rounded-2xl border border-border/50 hover:border-primary hover:shadow-lg transition-all duration-300"
              >
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900 dark:to-indigo-900 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <feature.icon className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
                <div className="flex-1">
                  <h4 className="text-xl font-semibold text-foreground mb-3">
                    {feature.title}
                  </h4>
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                  <div className="mt-4 flex items-center text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                    Learn more
                    <ArrowRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Analytics Features - Stats Cards */}
        <div>
          <div className="flex items-center mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mr-4">
              <BarChart3 className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-foreground">
                Analytics & Security
              </h3>
              <p className="text-muted-foreground">
                Advanced insights and enterprise-grade security
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {analyticsFeatures.map((feature, index) => (
              <Card
                key={index}
                className="group border-0 shadow-lg hover:shadow-2xl transition-all duration-300 bg-gradient-to-br from-background via-background/80 to-background/60 backdrop-blur-sm overflow-hidden relative"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full blur-2xl group-hover:from-blue-500/20 group-hover:to-purple-500/20 transition-colors"></div>
                <CardHeader className="relative">
                  <div className="flex items-start justify-between">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <feature.icon className="h-8 w-8 text-white" />
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold">{feature.stats}</div>
                    </div>
                  </div>
                  <CardTitle className="text-xl mt-4">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="relative">
                  <CardDescription className="text-muted-foreground text-base leading-relaxed">
                    {feature.description}
                  </CardDescription>
                  <div className="mt-6 flex items-center font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                    Explore feature
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
