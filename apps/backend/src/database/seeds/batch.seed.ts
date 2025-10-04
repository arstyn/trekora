// Helper function to get future dates
const getFutureDate = (daysFromNow: number): string => {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  return date.toISOString().split('T')[0];
};

export const batches = [
  // Himalayan Adventure Trek batches
  {
    startDate: getFutureDate(30), // 30 days from now
    endDate: getFutureDate(43), // 43 days from now
    totalSeats: 12,
    bookedSeats: 0,
    status: 'active',
    packageName: 'Himalayan Adventure Trek',
    organizationDomain: 'acme.com',
    coordinators: ['sarah.wilson@acme.com', 'michael.chen@acme.com'],
  },
  {
    startDate: getFutureDate(90), // 90 days from now
    endDate: getFutureDate(103), // 103 days from now
    totalSeats: 12,
    bookedSeats: 0,
    status: 'active',
    packageName: 'Himalayan Adventure Trek',
    organizationDomain: 'acme.com',
    coordinators: ['sarah.wilson@acme.com'],
  },
  {
    startDate: getFutureDate(120), // 120 days from now
    endDate: getFutureDate(133), // 133 days from now
    totalSeats: 12,
    bookedSeats: 0,
    status: 'active',
    packageName: 'Himalayan Adventure Trek',
    organizationDomain: 'acme.com',
    coordinators: ['michael.chen@acme.com', 'emily.rodriguez@acme.com'],
  },

  // Cultural Heritage Tour of Rajasthan batches
  {
    startDate: getFutureDate(45), // 45 days from now
    endDate: getFutureDate(54), // 54 days from now
    totalSeats: 15,
    bookedSeats: 0,
    status: 'active',
    packageName: 'Cultural Heritage Tour of Rajasthan',
    organizationDomain: 'globex.co',
    coordinators: ['lisa.park@globex.co', 'david.kumar@globex.co'],
  },
  {
    startDate: getFutureDate(75), // 75 days from now
    endDate: getFutureDate(84), // 84 days from now
    totalSeats: 15,
    bookedSeats: 0,
    status: 'active',
    packageName: 'Cultural Heritage Tour of Rajasthan',
    organizationDomain: 'globex.co',
    coordinators: ['james.thompson@globex.co'],
  },
  {
    startDate: getFutureDate(105), // 105 days from now
    endDate: getFutureDate(114), // 114 days from now
    totalSeats: 15,
    bookedSeats: 0,
    status: 'active',
    packageName: 'Cultural Heritage Tour of Rajasthan',
    organizationDomain: 'globex.co',
    coordinators: ['lisa.park@globex.co'],
  },

  // Tropical Paradise Getaway batches
  {
    startDate: getFutureDate(40), // 40 days from now
    endDate: getFutureDate(46), // 46 days from now
    totalSeats: 8,
    bookedSeats: 0,
    status: 'active',
    packageName: 'Tropical Paradise Getaway',
    organizationDomain: 'initech.org',
    coordinators: ['robert.martinez@initech.org'],
  },
  {
    startDate: getFutureDate(70), // 70 days from now
    endDate: getFutureDate(76), // 76 days from now
    totalSeats: 8,
    bookedSeats: 0,
    status: 'active',
    packageName: 'Tropical Paradise Getaway',
    organizationDomain: 'initech.org',
    coordinators: ['jennifer.lee@initech.org', 'robert.martinez@initech.org'],
  },
  {
    startDate: getFutureDate(100), // 100 days from now
    endDate: getFutureDate(106), // 106 days from now
    totalSeats: 8,
    bookedSeats: 0,
    status: 'active',
    packageName: 'Tropical Paradise Getaway',
    organizationDomain: 'initech.org',
    coordinators: ['jennifer.lee@initech.org'],
  },

  // African Safari Adventure batches
  {
    startDate: getFutureDate(50), // 50 days from now
    endDate: getFutureDate(61), // 61 days from now
    totalSeats: 10,
    bookedSeats: 0,
    status: 'active',
    packageName: 'African Safari Adventure',
    organizationDomain: 'umbrella.com',
    coordinators: ['kevin.zhang@umbrella.com', 'maria.santos@umbrella.com'],
  },
  {
    startDate: getFutureDate(80), // 80 days from now
    endDate: getFutureDate(91), // 91 days from now
    totalSeats: 10,
    bookedSeats: 0,
    status: 'active',
    packageName: 'African Safari Adventure',
    organizationDomain: 'umbrella.com',
    coordinators: ['thomas.anderson@umbrella.com'],
  },
  {
    startDate: getFutureDate(110), // 110 days from now
    endDate: getFutureDate(121), // 121 days from now
    totalSeats: 10,
    bookedSeats: 0,
    status: 'active',
    packageName: 'African Safari Adventure',
    organizationDomain: 'umbrella.com',
    coordinators: ['amanda.foster@umbrella.com', 'kevin.zhang@umbrella.com'],
  },

  // European Grand Tour batches
  {
    startDate: getFutureDate(35), // 35 days from now
    endDate: getFutureDate(55), // 55 days from now
    totalSeats: 20,
    bookedSeats: 0,
    status: 'active',
    packageName: 'European Grand Tour',
    organizationDomain: 'acme.com',
    coordinators: ['sarah.wilson@acme.com', 'emily.rodriguez@acme.com'],
  },
  {
    startDate: getFutureDate(65), // 65 days from now
    endDate: getFutureDate(85), // 85 days from now
    totalSeats: 20,
    bookedSeats: 0,
    status: 'active',
    packageName: 'European Grand Tour',
    organizationDomain: 'acme.com',
    coordinators: ['michael.chen@acme.com'],
  },
  {
    startDate: getFutureDate(95), // 95 days from now
    endDate: getFutureDate(115), // 115 days from now
    totalSeats: 20,
    bookedSeats: 0,
    status: 'active',
    packageName: 'European Grand Tour',
    organizationDomain: 'acme.com',
    coordinators: ['sarah.wilson@acme.com', 'michael.chen@acme.com'],
  },
  {
    startDate: getFutureDate(125), // 125 days from now
    endDate: getFutureDate(145), // 145 days from now
    totalSeats: 20,
    bookedSeats: 0,
    status: 'active',
    packageName: 'European Grand Tour',
    organizationDomain: 'acme.com',
    coordinators: ['emily.rodriguez@acme.com'],
  },

  // Budget Backpacking Southeast Asia batches
  {
    startDate: getFutureDate(55), // 55 days from now
    endDate: getFutureDate(72), // 72 days from now
    totalSeats: 16,
    bookedSeats: 0,
    status: 'active',
    packageName: 'Budget Backpacking Southeast Asia',
    organizationDomain: 'globex.co',
    coordinators: ['david.kumar@globex.co'],
  },
  {
    startDate: getFutureDate(85), // 85 days from now
    endDate: getFutureDate(102), // 102 days from now
    totalSeats: 16,
    bookedSeats: 0,
    status: 'active',
    packageName: 'Budget Backpacking Southeast Asia',
    organizationDomain: 'globex.co',
    coordinators: ['james.thompson@globex.co', 'lisa.park@globex.co'],
  },
  {
    startDate: getFutureDate(115), // 115 days from now
    endDate: getFutureDate(132), // 132 days from now
    totalSeats: 16,
    bookedSeats: 0,
    status: 'active',
    packageName: 'Budget Backpacking Southeast Asia',
    organizationDomain: 'globex.co',
    coordinators: ['david.kumar@globex.co'],
  },

  // Additional upcoming batches for more variety
  {
    startDate: getFutureDate(140), // 140 days from now
    endDate: getFutureDate(154), // 154 days from now
    totalSeats: 12,
    bookedSeats: 0,
    status: 'upcoming',
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
    status: 'upcoming',
    packageName: 'Cultural Heritage Tour of Rajasthan',
    organizationDomain: 'globex.co',
    coordinators: ['james.thompson@globex.co', 'david.kumar@globex.co'],
  },
  {
    startDate: getFutureDate(180), // 180 days from now
    endDate: getFutureDate(186), // 186 days from now
    totalSeats: 8,
    bookedSeats: 0,
    status: 'upcoming',
    packageName: 'Tropical Paradise Getaway',
    organizationDomain: 'initech.org',
    coordinators: ['jennifer.lee@initech.org'],
  },
  {
    startDate: getFutureDate(200), // 200 days from now
    endDate: getFutureDate(211), // 211 days from now
    totalSeats: 10,
    bookedSeats: 0,
    status: 'upcoming',
    packageName: 'African Safari Adventure',
    organizationDomain: 'umbrella.com',
    coordinators: ['maria.santos@umbrella.com', 'thomas.anderson@umbrella.com'],
  },
  {
    startDate: getFutureDate(220), // 220 days from now
    endDate: getFutureDate(240), // 240 days from now
    totalSeats: 20,
    bookedSeats: 0,
    status: 'upcoming',
    packageName: 'European Grand Tour',
    organizationDomain: 'acme.com',
    coordinators: ['sarah.wilson@acme.com'],
  },
  {
    startDate: getFutureDate(250), // 250 days from now
    endDate: getFutureDate(267), // 267 days from now
    totalSeats: 16,
    bookedSeats: 0,
    status: 'upcoming',
    packageName: 'Budget Backpacking Southeast Asia',
    organizationDomain: 'globex.co',
    coordinators: ['lisa.park@globex.co'],
  },
];
