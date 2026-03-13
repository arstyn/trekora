import { BatchStatus } from '../entity/batch.entity';

// Helper function to get future dates
const getFutureDate = (daysFromNow: number): string => {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  return date.toISOString().split('T')[0];
};

export const batches = [
  // Additional upcoming batches for more variety
  {
    startDate: getFutureDate(140), // 140 days from now
    endDate: getFutureDate(154), // 154 days from now
    totalSeats: 12,
    bookedSeats: 0,
    status: BatchStatus.UPCOMING,
    packageName: 'Himalayan Adventure Trek',
    organizationDomain: 'acme.com',
    coordinators: [
      'sarah.wilson@acme.com',
      'michael.chen@acme.com',
      'emily.rodriguez@acme.com',
    ],
  },
  {
    startDate: getFutureDate(160), // 160 days from now
    endDate: getFutureDate(175), // 175 days from now
    totalSeats: 15,
    bookedSeats: 0,
    status: BatchStatus.UPCOMING,
    packageName: 'Cultural Heritage Tour of Rajasthan',
    organizationDomain: 'globex.co',
    coordinators: ['james.thompson@globex.co', 'david.kumar@globex.co'],
  },
  {
    startDate: getFutureDate(180), // 180 days from now
    endDate: getFutureDate(186), // 186 days from now
    totalSeats: 8,
    bookedSeats: 0,
    status: BatchStatus.UPCOMING,
    packageName: 'Tropical Paradise Getaway',
    organizationDomain: 'initech.org',
    coordinators: ['jennifer.lee@initech.org'],
  },
  {
    startDate: getFutureDate(200), // 200 days from now
    endDate: getFutureDate(211), // 211 days from now
    totalSeats: 10,
    bookedSeats: 0,
    status: BatchStatus.UPCOMING,
    packageName: 'African Safari Adventure',
    organizationDomain: 'umbrella.com',
    coordinators: ['maria.santos@umbrella.com', 'thomas.anderson@umbrella.com'],
  },
  {
    startDate: getFutureDate(220), // 220 days from now
    endDate: getFutureDate(240), // 240 days from now
    totalSeats: 20,
    bookedSeats: 0,
    status: BatchStatus.UPCOMING,
    packageName: 'European Grand Tour',
    organizationDomain: 'acme.com',
    coordinators: ['sarah.wilson@acme.com'],
  },
  {
    startDate: getFutureDate(250), // 250 days from now
    endDate: getFutureDate(267), // 267 days from now
    totalSeats: 16,
    bookedSeats: 0,
    status: BatchStatus.UPCOMING,
    packageName: 'Budget Backpacking Southeast Asia',
    organizationDomain: 'globex.co',
    coordinators: ['lisa.park@globex.co'],
  },
];
