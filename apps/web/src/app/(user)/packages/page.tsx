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
import { Plus, MapPin, Calendar, Users, DollarSign } from 'lucide-react';
import Image from 'next/image';

// Mock data for tour packages
const tourPackages = [
  {
    id: 1,
    name: 'Bali Paradise Getaway',
    destination: 'Bali, Indonesia',
    duration: '7 Days, 6 Nights',
    price: 1299,
    status: 'published',
    image: '/placeholder.svg',
    description:
      'Experience the magic of Bali with pristine beaches, ancient temples, and vibrant culture.',
    maxGuests: 12,
    startDate: '2024-03-15',
  },
  {
    id: 2,
    name: 'Swiss Alps Adventure',
    destination: 'Switzerland',
    duration: '10 Days, 9 Nights',
    price: 2499,
    status: 'draft',
    image: '/placeholder.svg',
    description:
      'Breathtaking mountain views, luxury resorts, and outdoor adventures in the Swiss Alps.',
    maxGuests: 8,
    startDate: '2024-04-20',
  },
  {
    id: 3,
    name: 'Tokyo Cultural Experience',
    destination: 'Tokyo, Japan',
    duration: '5 Days, 4 Nights',
    price: 1899,
    status: 'published',
    image: '/placeholder.svg',
    description:
      'Immerse yourself in Japanese culture, cuisine, and modern city life.',
    maxGuests: 15,
    startDate: '2024-05-10',
  },
  {
    id: 4,
    name: 'Santorini Sunset Romance',
    destination: 'Santorini, Greece',
    duration: '6 Days, 5 Nights',
    price: 1699,
    status: 'published',
    image: '/placeholder.svg',
    description:
      'Romantic getaway with stunning sunsets, white-washed buildings, and Mediterranean charm.',
    maxGuests: 10,
    startDate: '2024-06-01',
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold">Travel Agency</h1>
              <p className="">Manage your tour packages</p>
            </div>
            <Link href="packages/create">
              <Button className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Create Package
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="px-6">
              <div className="flex items-center">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <MapPin className="w-6 h-6 text-primary" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium">Total Packages</p>
                  <p className="text-2xl font-bold">{tourPackages.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="px-6">
              <div className="flex items-center">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Calendar className="w-6 h-6 text-primary" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium">Published</p>
                  <p className="text-2xl font-bold">
                    {
                      tourPackages.filter((pkg) => pkg.status === 'published')
                        .length
                    }
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="px-6">
              <div className="flex items-center">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium">Drafts</p>
                  <p className="text-2xl font-bold">
                    {
                      tourPackages.filter((pkg) => pkg.status === 'draft')
                        .length
                    }
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="px-6">
              <div className="flex items-center">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <DollarSign className="w-6 h-6 text-primary" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium">Avg. Price</p>
                  <p className="text-2xl font-bold">
                    $
                    {Math.round(
                      tourPackages.reduce((sum, pkg) => sum + pkg.price, 0) /
                        tourPackages.length,
                    )}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Package Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tourPackages.map((pkg) => (
            <Card
              key={pkg.id}
              className="overflow-hidden hover:shadow-lg transition-shadow pt-0"
            >
              <div className="relative">
                <Image
                  src={pkg.image || '/placeholder.svg'}
                  alt={pkg.name}
                  width={300}
                  height={200}
                  className="w-full h-48 object-cover"
                />
                <Badge
                  className={`absolute top-2 right-2 ${
                    pkg.status === 'published'
                      ? 'bg-green-500 hover:bg-green-600'
                      : 'bg-yellow-500 hover:bg-yellow-600'
                  }`}
                >
                  {pkg.status}
                </Badge>
              </div>

              <CardHeader>
                <CardTitle className="text-lg">{pkg.name}</CardTitle>
                <CardDescription className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {pkg.destination}
                </CardDescription>
              </CardHeader>

              <CardContent>
                <p className="text-sm  mb-4">{pkg.description}</p>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="">Duration:</span>
                    <span className="font-medium">{pkg.duration}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="">Max Guests:</span>
                    <span className="font-medium">{pkg.maxGuests} people</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="">Starting:</span>
                    <span className="font-medium">
                      {new Date(pkg.startDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold text-primary">
                    ${pkg.price}
                  </div>
                  <div className="flex gap-2">
                    <Link href={`/packages/edit/${pkg.id}`}>
                      <Button
                        variant="outline"
                        size="sm"
                        className="cursor-pointer"
                      >
                        Edit
                      </Button>
                    </Link>
                    <Link href={`/packages/${pkg.id}`}>
                      <Button size="sm" className="cursor-pointer">
                        View
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}
