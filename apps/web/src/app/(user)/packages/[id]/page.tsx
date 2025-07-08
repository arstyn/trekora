'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  Edit,
  MapPin,
  Calendar,
  Users,
  DollarSign,
  CheckCircle,
  XCircle,
  Clock,
} from 'lucide-react';
import Image from 'next/image';

// Mock data for viewing
const mockPackageData = {
  id: 1,
  name: 'Bali Paradise Getaway',
  destination: 'Bali, Indonesia',
  duration: '7 Days, 6 Nights',
  price: '1299',
  description:
    'Experience the magic of Bali with pristine beaches, ancient temples, and vibrant culture. This comprehensive package includes everything you need for an unforgettable Indonesian adventure.',
  maxGuests: '12',
  startDate: '2024-03-15',
  endDate: '2024-03-21',
  difficulty: 'easy',
  category: 'relaxation',
  inclusions: [
    'Airport transfers',
    'Hotel accommodation',
    'Daily breakfast',
    'Tour guide',
    'All entrance fees',
  ],
  exclusions: [
    'International flights',
    'Travel insurance',
    'Personal expenses',
    'Alcoholic beverages',
  ],
  status: 'published',
  thumbnail: '/placeholder.svg',
  paymentStructure: [
    {
      id: '1',
      name: 'Booking Advance',
      percentage: 10,
      description: 'Initial booking amount',
      dueDate: 'booking',
    },
    {
      id: '2',
      name: 'Confirmation',
      percentage: 40,
      description: 'Confirmation payment',
      dueDate: '30_days_before',
    },
    {
      id: '3',
      name: 'Pre-departure',
      percentage: 50,
      description: 'Final payment',
      dueDate: '2_weeks_before',
    },
  ],
  cancellationStructure: [
    {
      id: '1',
      timeframe: '30+ days before',
      percentage: 10,
      description: 'Minimal cancellation fee',
    },
    {
      id: '2',
      timeframe: '15-29 days before',
      percentage: 25,
      description: 'Standard cancellation fee',
    },
    {
      id: '3',
      timeframe: '7-14 days before',
      percentage: 50,
      description: 'High cancellation fee',
    },
    {
      id: '4',
      timeframe: 'Less than 7 days',
      percentage: 100,
      description: 'No refund',
    },
  ],
  cancellationPolicy: [
    'Cancellation must be made in writing',
    'Refunds will be processed within 7-10 business days',
    'Travel insurance is recommended',
    'Force majeure conditions may apply',
  ],
  mealsBreakdown: {
    breakfast: [
      'Continental breakfast',
      'Fresh tropical fruits',
      'Coffee/Tea',
      'Local pastries',
    ],
    lunch: [
      'Local Indonesian cuisine',
      'Vegetarian options available',
      'Fresh seafood',
      'Traditional beverages',
    ],
    dinner: [
      '3-course dinner',
      'Local specialties',
      'International cuisine options',
      'Welcome and farewell dinners',
    ],
  },
  transportation: {
    toDestination: {
      mode: 'flight',
      details: 'Economy class, connecting flight via Singapore',
      included: false,
    },
    fromDestination: {
      mode: 'flight',
      details: 'Economy class, connecting flight via Singapore',
      included: false,
    },
    duringTrip: {
      mode: 'bus',
      details: 'Air-conditioned coach with professional driver',
      included: true,
    },
  },
  packageLocation: {
    type: 'international' as const,
    country: 'Indonesia',
    state: '',
  },
  documentRequirements: [
    {
      id: '1',
      name: 'Valid Passport',
      description: 'Passport valid for at least 6 months from travel date',
      mandatory: true,
      applicableFor: 'all' as const,
    },
    {
      id: '2',
      name: 'Tourist Visa',
      description: 'Tourist visa for Indonesia (Visa on Arrival available)',
      mandatory: true,
      applicableFor: 'all' as const,
    },
    {
      id: '3',
      name: 'Birth Certificate',
      description: 'For children under 18 traveling without both parents',
      mandatory: true,
      applicableFor: 'children' as const,
    },
  ],
  preTripChecklist: [
    {
      id: '1',
      task: 'Collect all documents',
      description: 'Verify all required documents are collected from travelers',
      category: 'documents' as const,
      dueDate: '2_weeks_before',
      completed: true,
    },
    {
      id: '2',
      task: 'Confirm hotel bookings',
      description: 'Confirm all hotel reservations and special requests',
      category: 'booking' as const,
      dueDate: '1_week_before',
      completed: true,
    },
    {
      id: '3',
      task: 'Brief tour guide',
      description:
        'Provide tour guide with group details and special requirements',
      category: 'preparation' as const,
      dueDate: '3_days_before',
      completed: false,
    },
    {
      id: '4',
      task: 'Send final itinerary',
      description:
        'Send detailed itinerary and contact information to travelers',
      category: 'communication' as const,
      dueDate: '1_week_before',
      completed: false,
    },
  ],
  itinerary: [
    {
      day: 1,
      title: 'Arrival in Bali',
      description:
        'Welcome to paradise! Arrive at Ngurah Rai International Airport and transfer to your beachfront resort.',
      activities: [
        'Airport pickup by private vehicle',
        'Hotel check-in and welcome drink',
        'Resort orientation',
        'Welcome dinner with traditional Balinese performance',
      ],
      meals: ['Dinner'],
      accommodation: 'Luxury Beach Resort - Ocean View Room',
      images: ['/placeholder.svg', '/placeholder.svg', '/placeholder.svg'],
    },
    {
      day: 2,
      title: 'Temple Tour & Cultural Experience',
      description:
        'Explore the spiritual heart of Bali with visits to iconic temples and cultural sites.',
      activities: [
        'Visit Tanah Lot Temple at sunrise',
        'Traditional Balinese cooking class',
        'Uluwatu Temple and cliff-top views',
        'Kecak fire dance performance',
      ],
      meals: ['Breakfast', 'Lunch', 'Dinner'],
      accommodation: 'Luxury Beach Resort - Ocean View Room',
      images: ['/placeholder.svg', '/placeholder.svg'],
    },
    {
      day: 3,
      title: 'Rice Terraces & Volcano Adventure',
      description:
        "Journey through Bali's stunning landscapes and natural wonders.",
      activities: [
        'Jatiluwih Rice Terraces UNESCO site',
        'Mount Batur volcano viewpoint',
        'Traditional village visit',
        'Local handicraft shopping',
      ],
      meals: ['Breakfast', 'Lunch'],
      accommodation: 'Mountain Lodge - Traditional Bungalow',
      images: ['/placeholder.svg'],
    },
  ],
};

export default function ViewPackagePage({
  params,
}: {
  params: { id: string };
}) {
  const [packageData, setPackageData] = useState(mockPackageData);

  const completedTasks = packageData.preTripChecklist.filter(
    (item) => item.completed,
  ).length;
  const totalTasks = packageData.preTripChecklist.length;
  const completionPercentage = Math.round((completedTasks / totalTasks) * 100);

  return (
    <div className="min-h-screen ">
      {/* Header */}
      {/* Hero Section */}
      <section className="relative">
        <div className="h-96 relative">
          <Image
            src={packageData.thumbnail || '/placeholder.svg'}
            alt={packageData.name}
            fill
            className="object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-opacity-40" />
          <div className="absolute bottom-6 left-6">
            <div className="flex items-center gap-4 mb-4">
              <Badge
                variant={
                  packageData.status === 'published' ? 'default' : 'secondary'
                }
                className="text-sm"
              >
                {packageData.status}
              </Badge>
              <Badge
                variant={
                  packageData.packageLocation.type === 'international'
                    ? 'default'
                    : 'secondary'
                }
              >
                {packageData.packageLocation.type}
              </Badge>
            </div>
            <h2 className="text-4xl font-bold mb-2">{packageData.name}</h2>
            <p className=" flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              {packageData.destination}
            </p>
          </div>
        </div>
        <Link
          href={`/edit-package/${params.id}`}
          className="absolute top-5 right-5"
        >
          <Button>
            <Edit className="w-4 h-4 mr-2" />
            Edit Package
          </Button>
        </Link>
      </section>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Package Overview */}
            <Card>
              <CardHeader>
                <CardTitle>Package Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <p className=" leading-relaxed">{packageData.description}</p>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-primary/10 rounded-lg">
                    <Calendar className="w-8 h-8 text-primary mx-auto mb-2" />
                    <div className="text-sm text-muted-foreground">
                      Duration
                    </div>
                    <div className="font-semibold">{packageData.duration}</div>
                  </div>
                  <div className="text-center p-4 bg-primary/10 rounded-lg">
                    <DollarSign className="w-8 h-8 text-primary mx-auto mb-2" />
                    <div className="text-sm text-muted-foreground">Price</div>
                    <div className="font-semibold">${packageData.price}</div>
                  </div>
                  <div className="text-center p-4 bg-primary/10 rounded-lg">
                    <Users className="w-8 h-8 text-primary mx-auto mb-2" />
                    <div className="text-sm text-muted-foreground">
                      Max Guests
                    </div>
                    <div className="font-semibold">{packageData.maxGuests}</div>
                  </div>
                  <div className="text-center p-4 bg-primary/10 rounded-lg">
                    <MapPin className="w-8 h-8 text-primary mx-auto mb-2" />
                    <div className="text-sm text-muted-foreground">
                      Difficulty
                    </div>
                    <div className="font-semibold capitalize">
                      {packageData.difficulty}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Detailed Itinerary */}
            <Card>
              <CardHeader>
                <CardTitle>Detailed Itinerary</CardTitle>
                <CardDescription>
                  {packageData.itinerary.length} days of amazing experiences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {packageData.itinerary.map((day, index) => (
                  <div key={index} className="border rounded-lg p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">
                        {day.day}
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold">{day.title}</h3>
                        <p className="">{day.description}</p>
                      </div>
                    </div>

                    {/* Day Images */}
                    {day.images.length > 0 && (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
                        {day.images.map((image, imageIndex) => (
                          <Image
                            key={imageIndex}
                            src={image || '/placeholder.svg'}
                            alt={`Day ${day.day} - Image ${imageIndex + 1}`}
                            width={200}
                            height={150}
                            className="rounded-lg object-cover"
                          />
                        ))}
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold mb-2">Activities</h4>
                        <ul className="space-y-1">
                          {day.activities.map((activity, actIndex) => (
                            <li
                              key={actIndex}
                              className="flex items-start gap-2"
                            >
                              <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0" />
                              <span className="">{activity}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-2">Details</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="">Meals:</span>
                            <span>{day.meals.join(', ') || 'None'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="">Accommodation:</span>
                            <span>{day.accommodation}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Payment Structure */}
            <Card>
              <CardHeader>
                <CardTitle>Payment Structure</CardTitle>
                <CardDescription>
                  How and when to pay for this package
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {packageData.paymentStructure.map((milestone, index) => (
                    <div
                      key={milestone.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div>
                        <h4 className="font-semibold">{milestone.name}</h4>
                        <p className="text-sm ">{milestone.description}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-primary">
                          {milestone.percentage}%
                        </div>
                        <div className="text-sm  capitalize">
                          {milestone.dueDate.replace('_', ' ')}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Cancellation Policy */}
            <Card>
              <CardHeader>
                <CardTitle>Cancellation Policy</CardTitle>
                <CardDescription>Cancellation fees and terms</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <h4 className="font-semibold">Cancellation Fees</h4>
                  {packageData.cancellationStructure.map((tier, index) => (
                    <div
                      key={tier.id}
                      className="flex items-center justify-between p-3  rounded-lg"
                    >
                      <div>
                        <span className="font-medium">{tier.timeframe}</span>
                        <p className="text-sm ">{tier.description}</p>
                      </div>
                      <Badge variant="outline">{tier.percentage}% fee</Badge>
                    </div>
                  ))}
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold">Policy Terms</h4>
                  <ul className="space-y-2">
                    {packageData.cancellationPolicy.map((point, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0" />
                        <span className="">{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Document Requirements */}
            <Card>
              <CardHeader>
                <CardTitle>Document Requirements</CardTitle>
                <CardDescription>
                  Required documents for all travelers
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3 text-blue-600">
                      All Travelers
                    </h4>
                    <div className="space-y-3">
                      {packageData.documentRequirements
                        .filter((doc) => doc.applicableFor === 'all')
                        .map((doc, index) => (
                          <div key={doc.id} className="p-3 border rounded-lg">
                            <div className="flex items-center gap-2 mb-1">
                              <h5 className="font-medium">{doc.name}</h5>
                              {doc.mandatory && (
                                <Badge
                                  variant="destructive"
                                  className="text-xs"
                                >
                                  Required
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm ">{doc.description}</p>
                          </div>
                        ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-3 text-green-600">
                      Children Only
                    </h4>
                    <div className="space-y-3">
                      {packageData.documentRequirements
                        .filter((doc) => doc.applicableFor === 'children')
                        .map((doc, index) => (
                          <div key={doc.id} className="p-3 border rounded-lg">
                            <div className="flex items-center gap-2 mb-1">
                              <h5 className="font-medium">{doc.name}</h5>
                              {doc.mandatory && (
                                <Badge
                                  variant="destructive"
                                  className="text-xs"
                                >
                                  Required
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm ">{doc.description}</p>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Meals Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>Meals Included</CardTitle>
                <CardDescription>What's included in each meal</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {Object.entries(packageData.mealsBreakdown).map(
                    ([mealType, items]) => (
                      <div key={mealType}>
                        <h4 className="font-semibold mb-3 capitalize text-primary">
                          {mealType}
                        </h4>
                        <ul className="space-y-2">
                          {items.map((item, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0" />
                              <span className=" text-sm">{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ),
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Transportation */}
            <Card>
              <CardHeader>
                <CardTitle>Transportation</CardTitle>
                <CardDescription>
                  How you'll get there and around
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-semibold mb-2">To Destination</h4>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="">Mode:</span>
                          <span className="capitalize">
                            {packageData.transportation.toDestination.mode}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="">Details:</span>
                          <span>
                            {packageData.transportation.toDestination.details}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="">Included:</span>
                          <Badge
                            variant={
                              packageData.transportation.toDestination.included
                                ? 'default'
                                : 'outline'
                            }
                          >
                            {packageData.transportation.toDestination.included
                              ? 'Yes'
                              : 'No'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-semibold mb-2">From Destination</h4>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="">Mode:</span>
                          <span className="capitalize">
                            {packageData.transportation.fromDestination.mode}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="">Details:</span>
                          <span>
                            {packageData.transportation.fromDestination.details}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="">Included:</span>
                          <Badge
                            variant={
                              packageData.transportation.fromDestination
                                .included
                                ? 'default'
                                : 'outline'
                            }
                          >
                            {packageData.transportation.fromDestination.included
                              ? 'Yes'
                              : 'No'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2">During Trip</h4>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div className="flex justify-between">
                        <span className="">Mode:</span>
                        <span className="capitalize">
                          {packageData.transportation.duringTrip.mode}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="">Details:</span>
                        <span>
                          {packageData.transportation.duringTrip.details}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="">Included:</span>
                        <Badge
                          variant={
                            packageData.transportation.duringTrip.included
                              ? 'default'
                              : 'outline'
                          }
                        >
                          {packageData.transportation.duringTrip.included
                            ? 'Yes'
                            : 'No'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Info */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm ">Package Type:</span>
                  <Badge
                    variant={
                      packageData.packageLocation.type === 'international'
                        ? 'default'
                        : 'secondary'
                    }
                  >
                    {packageData.packageLocation.type}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm ">Country:</span>
                  <span className="text-sm font-medium">
                    {packageData.packageLocation.country}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm ">Category:</span>
                  <span className="text-sm font-medium capitalize">
                    {packageData.category}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm ">Start Date:</span>
                  <span className="text-sm font-medium">
                    {new Date(packageData.startDate).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm ">End Date:</span>
                  <span className="text-sm font-medium">
                    {new Date(packageData.endDate).toLocaleDateString()}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Pre-Trip Checklist Progress */}
            <Card>
              <CardHeader>
                <CardTitle>Pre-Trip Checklist</CardTitle>
                <CardDescription>Operator preparation progress</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Overall Progress</span>
                  <span className="text-sm font-bold">
                    {completionPercentage}%
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${completionPercentage}%` }}
                  />
                </div>

                <div className="space-y-2">
                  {packageData.preTripChecklist.map((item, index) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-2 p-2 rounded border"
                    >
                      {item.completed ? (
                        <CheckCircle className="w-4 h-4 text-primary" />
                      ) : (
                        <Clock className="w-4 h-4 text-muted-foreground" />
                      )}
                      <div className="flex-1">
                        <div className="text-sm font-medium">{item.task}</div>
                        <div className="text-xs ">{item.category}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Inclusions & Exclusions */}
            <Card>
              <CardHeader>
                <CardTitle>What's Included</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold text-primary mb-2">Included</h4>
                  <div className="space-y-1">
                    {packageData.inclusions.map((item, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-primary" />
                        <span className="text-sm">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-destructive mb-2">
                    Not Included
                  </h4>
                  <div className="space-y-1">
                    {packageData.exclusions.map((item, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <XCircle className="w-4 h-4 text-destructive" />
                        <span className="text-sm">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
