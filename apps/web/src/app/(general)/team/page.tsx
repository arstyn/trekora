import { Card, CardContent } from '@/components/ui/card';
import { Linkedin, Twitter } from 'lucide-react';
import Image from 'next/image';

export default function Team() {
  const team = [
    {
      name: 'Alex Johnson',
      role: 'CEO & Co-Founder',
      image: '/placeholder.svg?height=300&width=300',
      bio: '15+ years in travel industry, former VP at major travel corporation. Passionate about transforming travel technology.',
      linkedin: '#',
      twitter: '#',
    },
    {
      name: 'Sarah Chen',
      role: 'CTO & Co-Founder',
      image: '/placeholder.svg?height=300&width=300',
      bio: 'Former senior engineer at Google. Expert in scalable systems and multi-tenant architecture.',
      linkedin: '#',
      twitter: '#',
    },
    {
      name: 'Michael Rodriguez',
      role: 'VP of Product',
      image: '/placeholder.svg?height=300&width=300',
      bio: 'Product leader with 12+ years experience building SaaS platforms for enterprise customers.',
      linkedin: '#',
      twitter: '#',
    },
    {
      name: 'Emily Davis',
      role: 'VP of Engineering',
      image: '/placeholder.svg?height=300&width=300',
      bio: 'Engineering leader focused on building reliable, scalable systems. Former tech lead at Airbnb.',
      linkedin: '#',
      twitter: '#',
    },
    {
      name: 'David Kim',
      role: 'Head of Sales',
      image: '/placeholder.svg?height=300&width=300',
      bio: 'Sales executive with deep understanding of travel industry needs and customer success.',
      linkedin: '#',
      twitter: '#',
    },
    {
      name: 'Lisa Thompson',
      role: 'Head of Customer Success',
      image: '/placeholder.svg?height=300&width=300',
      bio: 'Customer success expert dedicated to ensuring our clients achieve their business goals.',
      linkedin: '#',
      twitter: '#',
    },
  ];

  return (
    <div className="pt-16">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-indigo-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl">
            Meet Our Team
          </h1>
          <p className="mt-6 text-xl text-gray-600 max-w-3xl mx-auto">
            We're a passionate team of travel industry veterans and technology
            experts committed to revolutionizing how travel companies operate.
          </p>
        </div>
      </section>

      {/* Team Grid */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {team.map((member, index) => (
              <Card
                key={index}
                className="border-0 shadow-lg hover:shadow-xl transition-shadow"
              >
                <CardContent className="p-8 text-center">
                  <Image
                    src={member.image || '/placeholder.svg'}
                    alt={member.name}
                    width={300}
                    height={300}
                    className="w-32 h-32 rounded-full mx-auto mb-6 object-cover"
                  />
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {member.name}
                  </h3>
                  <p className="text-blue-600 font-medium mb-4">
                    {member.role}
                  </p>
                  <p className="text-gray-600 mb-6">{member.bio}</p>
                  <div className="flex justify-center space-x-4">
                    <a
                      href={member.linkedin}
                      className="text-gray-400 hover:text-blue-600"
                    >
                      <Linkedin className="h-5 w-5" />
                    </a>
                    <a
                      href={member.twitter}
                      className="text-gray-400 hover:text-blue-600"
                    >
                      <Twitter className="h-5 w-5" />
                    </a>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Join Us Section */}
      <section className="bg-blue-600 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white sm:text-4xl">
            Join Our Team
          </h2>
          <p className="mt-4 text-xl text-emerald-100 max-w-2xl mx-auto">
            We're always looking for talented individuals who share our passion
            for transforming the travel industry.
          </p>
          <div className="mt-8">
            <a
              href="/careers"
              className="inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-blue-600 bg-white hover:bg-gray-50"
            >
              View Open Positions
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
