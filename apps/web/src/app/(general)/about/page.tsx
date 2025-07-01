import { Card, CardContent } from '@/components/ui/card';
import { Target, Eye, Award, Users } from 'lucide-react';
import Image from 'next/image';

export default function About() {
  const values = [
    {
      icon: Target,
      title: 'Innovation',
      description:
        'We continuously innovate to provide cutting-edge solutions for the travel industry.',
    },
    {
      icon: Users,
      title: 'Customer Success',
      description:
        "Our customers' success is our success. We're committed to their growth and satisfaction.",
    },
    {
      icon: Award,
      title: 'Excellence',
      description:
        'We strive for excellence in everything we do, from product development to customer service.',
    },
    {
      icon: Eye,
      title: 'Transparency',
      description:
        'We believe in transparent communication and honest business practices.',
    },
  ];

  return (
    <div className="pt-16">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-indigo-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl">
              About Trekora
            </h1>
            <p className="mt-6 text-xl text-gray-600 max-w-3xl mx-auto">
              We're on a mission to revolutionize how travel companies operate
              by providing the most comprehensive and intuitive SaaS platform in
              the industry.
            </p>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-2 lg:gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Our Story
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                Founded in 2020, Trekora was born from the frustration of seeing
                travel companies struggle with fragmented systems and
                inefficient processes. Our founders, having worked in the travel
                industry for over a decade, understood the unique challenges
                faced by travel businesses.
              </p>
              <p className="text-lg text-gray-600 mb-6">
                We set out to create a unified platform that would address every
                aspect of travel business management - from package creation to
                customer engagement, from financial tracking to operational
                workflows.
              </p>
              <p className="text-lg text-gray-600">
                Today, Trekora serves over 500 travel companies worldwide,
                processing millions of bookings and helping businesses scale
                efficiently while maintaining exceptional customer service.
              </p>
            </div>
            <div className="mt-12 lg:mt-0">
              <Image
                src="/placeholder.svg?height=400&width=600"
                alt="Our Story"
                width={600}
                height={400}
                className="rounded-lg shadow-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <Card className="border-0 shadow-lg">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Our Mission
                </h3>
                <p className="text-lg text-gray-600">
                  To empower travel companies with innovative technology
                  solutions that streamline operations, enhance customer
                  experiences, and drive sustainable growth in the ever-evolving
                  travel industry.
                </p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-lg">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Our Vision
                </h3>
                <p className="text-lg text-gray-600">
                  To become the global standard for travel business management
                  platforms, enabling every travel company, regardless of size,
                  to operate with the efficiency and sophistication of industry
                  leaders.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              Our Values
            </h2>
            <p className="mt-4 text-xl text-gray-600">
              The principles that guide everything we do
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <Card key={index} className="border-0 shadow-md text-center">
                <CardContent className="p-8">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <value.icon className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    {value.title}
                  </h3>
                  <p className="text-gray-600">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
