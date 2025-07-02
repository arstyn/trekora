import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Check, X } from 'lucide-react';

export default function Pricing() {
  const plans = [
    {
      name: 'Starter',
      price: '$99',
      period: 'per month',
      description: 'Perfect for small travel agencies getting started',
      features: [
        'Up to 100 bookings/month',
        'Basic package management',
        'Customer management',
        'Email notifications',
        'Basic reporting',
        'Single branch support',
        'Email support',
      ],
      notIncluded: [
        'WhatsApp notifications',
        'Advanced analytics',
        'Multi-branch support',
        'API access',
        'Custom integrations',
      ],
      popular: false,
    },
    {
      name: 'Professional',
      price: '$299',
      period: 'per month',
      description: 'Ideal for growing travel companies',
      features: [
        'Up to 1,000 bookings/month',
        'Advanced package management',
        'Customer loyalty programs',
        'WhatsApp + Email + SMS notifications',
        'Advanced reporting & analytics',
        'Multi-branch support (up to 5)',
        'Finance management',
        'Operations management',
        'Priority support',
        'API access',
      ],
      notIncluded: ['Custom integrations', 'Dedicated account manager'],
      popular: true,
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      period: 'contact us',
      description: 'For large travel companies with complex needs',
      features: [
        'Unlimited bookings',
        'Full platform access',
        'Custom integrations',
        'Unlimited branches',
        'Advanced security features',
        'Dedicated account manager',
        '24/7 phone support',
        'Custom training',
        'SLA guarantee',
        'White-label options',
      ],
      notIncluded: [],
      popular: false,
    },
  ];

  return (
    <div className="relative min-h-screen w-full bg-gradient-to-br from-background to-background/80 overflow-hidden">
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

      {/* Hero Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold sm:text-5xl">
            Simple, Transparent Pricing
          </h1>
          <p className="mt-6 text-xl max-w-3xl mx-auto">
            Choose the perfect plan for your travel business. All plans include
            our core features with no hidden fees or setup costs.
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {plans.map((plan, index) => (
              <Card
                key={index}
                className={`relative ${plan.popular ? 'border-primary border-2 shadow-xl' : 'border-secondary shadow-lg'}`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-primary text-secondary px-4 py-2 rounded-full text-sm font-medium">
                      Most Popular
                    </span>
                  </div>
                )}
                <CardHeader className="text-center pb-8">
                  <CardTitle className="text-2xl font-bold">
                    {plan.name}
                  </CardTitle>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    {plan.period && <span className="ml-2">{plan.period}</span>}
                  </div>
                  <CardDescription className="mt-4 text-base">
                    {plan.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center">
                        <Check className="h-5 w-5 text-primary mr-3 flex-shrink-0" />
                        <span className="">{feature}</span>
                      </li>
                    ))}
                    {plan.notIncluded.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center">
                        <X className="h-5 w-5 text-muted-foreground mr-3 flex-shrink-0" />
                        <span className="text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button className={`w-full`} size="lg">
                    {plan.name === 'Enterprise'
                      ? 'Contact Sales'
                      : 'Start Free Trial'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold">Frequently Asked Questions</h2>
          </div>
          <div className="space-y-8">
            <div>
              <h3 className="text-lg font-semibold mb-2">
                Can I change my plan at any time?
              </h3>
              <p className="text-muted-foreground">
                Yes, you can upgrade or downgrade your plan at any time. Changes
                will be reflected in your next billing cycle.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">
                Is there a free trial available?
              </h3>
              <p className="text-muted-foreground">
                Yes, we offer a 14-day free trial for all plans. No credit card
                required to get started.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">
                What payment methods do you accept?
              </h3>
              <p className="text-muted-foreground">
                We accept all major credit cards, PayPal, and bank transfers for
                annual plans.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">
                Do you offer discounts for annual billing?
              </h3>
              <p className="">
                Yes, we offer a 20% discount when you choose annual billing for
                any plan.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
