export const packages = [
  {
    name: 'Himalayan Adventure Trek',
    destination: 'Nepal',
    duration: '14 days',
    price: 2500.0,
    description:
      'Experience the breathtaking beauty of the Himalayas with this 14-day trekking adventure. Journey through remote villages, cross high mountain passes, and witness stunning views of Mount Everest and other iconic peaks.',
    maxGuests: 12,
    category: 'adventure',
    status: 'published',
    thumbnail:
      'https://20jpaobz2o.ucarecd.net/81c06322-1717-4ee0-84a3-dff8c2bc47c8/himalaya.webp',
    organizationDomain: 'acme.com',
    inclusions: [
      'Professional trekking guide and porters',
      'All meals during the trek',
      'Accommodation in tea houses and lodges',
      'Trekking permits and TIMS card',
      'Airport transfers in Kathmandu',
      'Equipment rental (sleeping bag, trekking poles)',
      'First aid kit and emergency oxygen',
      'Cultural sightseeing in Kathmandu',
    ],
    exclusions: [
      'International flights to/from Kathmandu',
      'Travel insurance',
      'Personal expenses and tips',
      'Alcoholic beverages',
      'Hot showers (available at extra cost)',
      'Charging electronic devices (available at extra cost)',
    ],
    paymentStructure: [
      {
        name: 'Initial Deposit',
        amount: 625.0,
        description: 'Secure your spot with 25% down payment',
        dueDate: 'At time of booking',
      },
      {
        name: 'Second Payment',
        amount: 1250.0,
        description: 'Due 60 days before departure',
        dueDate: '60 days before trip',
      },
      {
        name: 'Final Payment',
        amount: 625.0,
        description: 'Remaining balance due 30 days before departure',
        dueDate: '30 days before trip',
      },
    ],
    cancellationStructure: [
      {
        timeframe: '60+ days before departure',
        amount: 250.0,
        description:
          'Administrative fee for cancellations 60+ days before departure',
      },
      {
        timeframe: '30-59 days before departure',
        amount: 625.0,
        description: '50% refund for cancellations 30-59 days before departure',
      },
      {
        timeframe: '15-29 days before departure',
        amount: 1250.0,
        description: '25% refund for cancellations 15-29 days before departure',
      },
      {
        timeframe: 'Less than 15 days',
        amount: 2500.0,
        description:
          'No refund for cancellations less than 15 days before departure',
      },
    ],
    cancellationPolicy: [
      'All cancellations must be made in writing and acknowledged by our office',
      'Refunds will be processed within 30 days of cancellation request',
      'No refunds for unused services during the trip',
      'Travel insurance is strongly recommended',
    ],
    documentRequirements: [
      {
        name: 'Valid Passport',
        description:
          'Passport must be valid for at least 6 months beyond the trip end date',
        mandatory: true,
        applicableFor: 'all',
      },
      {
        name: 'Visa',
        description:
          'Tourist visa for Nepal (obtainable on arrival for most nationalities)',
        mandatory: true,
        applicableFor: 'all',
      },
      {
        name: 'Travel Insurance',
        description:
          'Comprehensive travel insurance covering trekking activities up to 6000m',
        mandatory: true,
        applicableFor: 'all',
      },
      {
        name: 'Medical Certificate',
        description: 'Medical fitness certificate for high altitude trekking',
        mandatory: true,
        applicableFor: 'all',
      },
    ],
    preTripChecklist: [
      {
        task: 'Book international flights',
        description: 'Confirm flight bookings to/from Kathmandu',
        category: 'booking',
        dueDate: '90 days before trip',
        type: 'individual',
      },
      {
        task: 'Obtain travel insurance',
        description: 'Purchase comprehensive travel insurance',
        category: 'documents',
        dueDate: '60 days before trip',
        type: 'individual',
      },
      {
        task: 'Complete visa application',
        description: 'Apply for Nepal tourist visa',
        category: 'documents',
        dueDate: '45 days before trip',
        type: 'individual',
      },
      {
        task: 'Physical fitness preparation',
        description: 'Begin physical training for high altitude trekking',
        category: 'preparation',
        dueDate: '90 days before trip',
        type: 'individual',
      },
      {
        task: 'Pack trekking gear',
        description: 'Prepare and pack all necessary trekking equipment',
        category: 'preparation',
        dueDate: '7 days before trip',
        type: 'individual',
      },
    ],
    mealsBreakdown: {
      breakfast: [
        'Continental breakfast',
        'Nepali breakfast',
        'Tea and coffee',
      ],
      lunch: ['Traditional Nepali thali', 'Western options', 'Fresh fruits'],
      dinner: ['Local cuisine', 'International dishes', 'Vegetarian options'],
    },
    packageLocation: {
      type: 'international',
      country: 'Nepal',
      state: null,
    },
    transportation: {
      toDestination: {
        mode: 'Flight',
        details:
          'International flight to Kathmandu Tribhuvan International Airport',
        included: false,
      },
      fromDestination: {
        mode: 'Flight',
        details:
          'International flight from Kathmandu Tribhuvan International Airport',
        included: false,
      },
      duringTrip: {
        mode: 'Private Vehicle',
        details: 'Private 4WD vehicle for transfers and local transportation',
        included: true,
      },
    },
    itinerary: [
      {
        day: 1,
        title: 'Arrival in Kathmandu',
        description:
          'Arrive in Kathmandu, transfer to hotel, and brief orientation meeting',
        activities: [
          'Airport pickup',
          'Hotel check-in',
          'Orientation meeting',
          'Cultural dinner',
        ],
        meals: ['Dinner'],
        accommodation: 'Hotel in Kathmandu',
        images: [
          'https://20jpaobz2o.ucarecd.net/38d24731-2c84-4d02-a5ab-b1506f14b793/KathmanduandHeritageSiteTour6.jpg',
          'https://20jpaobz2o.ucarecd.net/45241f98-d546-4cc6-af3b-4e826dbbdebb/KDS_oy_lt_11631095017.jpg',
        ],
      },
      {
        day: 2,
        title: 'Kathmandu Sightseeing',
        description: 'Explore the cultural heritage sites of Kathmandu Valley',
        activities: [
          'Visit Swayambhunath',
          'Explore Durbar Square',
          'Visit Pashupatinath Temple',
        ],
        meals: ['Breakfast', 'Lunch'],
        accommodation: 'Hotel in Kathmandu',
        images: [
          'https://20jpaobz2o.ucarecd.net/b4a920a6-4fc2-41cf-888c-f80c6fabd548/durbarsquare2881273.jpg',
          'https://20jpaobz2o.ucarecd.net/1270b073-e8bf-4f6f-811a-92c3ee6e2a1f/4271971.webp',
        ],
      },
      {
        day: 3,
        title: 'Flight to Lukla and Trek to Phakding',
        description:
          'Scenic flight to Lukla and begin trekking to Phakding village',
        activities: [
          'Flight to Lukla',
          'Trek to Phakding (3 hours)',
          'Explore village',
        ],
        meals: ['Breakfast', 'Lunch', 'Dinner'],
        accommodation: 'Tea house in Phakding',
        images: [
          'https://20jpaobz2o.ucarecd.net/28d87f7e-0379-4006-8fec-5bfe50d86bfa/shutterstock_637126060_20190822125603_20190822125719.jpg',
          'https://20jpaobz2o.ucarecd.net/fe9860de-ae4b-41f1-b19d-ca79ef8aa22f/PhakdingVillage.jpg',
        ],
      },
    ],
  },
  {
    name: 'Cultural Heritage Tour of Rajasthan',
    destination: 'India',
    duration: '10 days',
    price: 1800.0,
    description:
      'Discover the rich cultural heritage of Rajasthan with visits to magnificent palaces, ancient forts, and vibrant markets. Experience traditional music, dance, and cuisine while exploring the royal cities of Jaipur, Udaipur, and Jodhpur.',
    maxGuests: 15,
    category: 'cultural',
    status: 'published',
    thumbnail:
      'https://20jpaobz2o.ucarecd.net/18f51369-093c-4ebe-a218-663cbae34562/rajasthan.jpg',
    organizationDomain: 'globex.co',
    inclusions: [
      'Professional tour guide',
      'All accommodation in heritage hotels',
      'All meals (breakfast, lunch, dinner)',
      'Private air-conditioned vehicle',
      'Entrance fees to all monuments',
      'Cultural performances and shows',
      'Camel safari in Jaisalmer',
      'Boat ride on Lake Pichola',
    ],
    exclusions: [
      'International flights to/from India',
      'Visa fees',
      'Travel insurance',
      'Personal expenses and shopping',
      'Alcoholic beverages',
      'Optional activities not mentioned',
    ],
    paymentStructure: [
      {
        name: 'Initial Deposit',
        amount: 540.0,
        description: 'Secure your spot with 30% down payment',
        dueDate: 'At time of booking',
      },
      {
        name: 'Second Payment',
        amount: 720.0,
        description: 'Due 45 days before departure',
        dueDate: '45 days before trip',
      },
      {
        name: 'Final Payment',
        amount: 540.0,
        description: 'Remaining balance due 15 days before departure',
        dueDate: '15 days before trip',
      },
    ],
    cancellationStructure: [
      {
        timeframe: '45+ days before departure',
        amount: 180.0,
        description:
          'Administrative fee for cancellations 45+ days before departure',
      },
      {
        timeframe: '30-44 days before departure',
        amount: 540.0,
        description: '70% refund for cancellations 30-44 days before departure',
      },
      {
        timeframe: '15-29 days before departure',
        amount: 900.0,
        description: '50% refund for cancellations 15-29 days before departure',
      },
      {
        timeframe: 'Less than 15 days',
        amount: 1800.0,
        description:
          'No refund for cancellations less than 15 days before departure',
      },
    ],
    cancellationPolicy: [
      'All cancellations must be made in writing and acknowledged by our office',
      'Refunds will be processed within 30 days of cancellation request',
      'No refunds for unused services during the trip',
      'Travel insurance is strongly recommended for international travel',
    ],
    documentRequirements: [
      {
        name: 'Valid Passport',
        description:
          'Passport must be valid for at least 6 months beyond the trip end date',
        mandatory: true,
        applicableFor: 'all',
      },
      {
        name: 'Indian Visa',
        description:
          'Tourist visa for India (apply online through e-Visa system)',
        mandatory: true,
        applicableFor: 'all',
      },
      {
        name: 'Travel Insurance',
        description:
          'Comprehensive travel insurance covering medical emergencies',
        mandatory: true,
        applicableFor: 'all',
      },
      {
        name: 'Yellow Fever Certificate',
        description: 'Required if traveling from yellow fever endemic areas',
        mandatory: false,
        applicableFor: 'all',
      },
    ],
    preTripChecklist: [
      {
        task: 'Book international flights',
        description: 'Confirm flight bookings to/from Delhi',
        category: 'booking',
        dueDate: '60 days before trip',
      },
      {
        task: 'Apply for Indian visa',
        description: 'Complete e-Visa application online',
        category: 'documents',
        dueDate: '30 days before trip',
      },
      {
        task: 'Purchase travel insurance',
        description: 'Buy comprehensive travel insurance',
        category: 'documents',
        dueDate: '45 days before trip',
      },
      {
        task: 'Research local customs',
        description: 'Learn about Indian culture and customs',
        category: 'preparation',
        dueDate: '30 days before trip',
      },
      {
        task: 'Pack appropriate clothing',
        description: 'Pack modest clothing suitable for temple visits',
        category: 'preparation',
        dueDate: '7 days before trip',
      },
    ],
    mealsBreakdown: {
      breakfast: [
        'Continental breakfast',
        'Indian breakfast',
        'Fresh fruits',
        'Tea and coffee',
      ],
      lunch: [
        'Traditional Rajasthani thali',
        'North Indian cuisine',
        'Vegetarian options',
      ],
      dinner: [
        'Royal Rajasthani feast',
        'Local specialties',
        'Desserts and sweets',
      ],
    },
    packageLocation: {
      type: 'international',
      country: 'India',
      state: 'Rajasthan',
    },
    transportation: {
      toDestination: {
        mode: 'Flight',
        details:
          'International flight to Delhi Indira Gandhi International Airport',
        included: false,
      },
      fromDestination: {
        mode: 'Flight',
        details:
          'International flight from Delhi Indira Gandhi International Airport',
        included: false,
      },
      duringTrip: {
        mode: 'Private Vehicle',
        details:
          'Air-conditioned private vehicle with driver for all transfers',
        included: true,
      },
    },
    itinerary: [
      {
        day: 1,
        title: 'Arrival in Delhi',
        description:
          'Arrive in Delhi, transfer to hotel, and brief orientation',
        activities: ['Airport pickup', 'Hotel check-in', 'Orientation meeting'],
        meals: ['Dinner'],
        accommodation: 'Heritage hotel in Delhi',
        images: [
          'https://20jpaobz2o.ucarecd.net/4d94b55e-a8f4-4e84-912e-a123e74349b3/NewDelhiIndiaWarMemorialarchSir.webp',
          'https://20jpaobz2o.ucarecd.net/25c9d002-0a26-44f5-af68-3b1cbd03c40f/lotustempledelhi.jpg',
          'https://20jpaobz2o.ucarecd.net/2159c393-330a-45f5-895b-38c4ac11576a/indiadelhiredfort.jpg',
        ],
      },
      {
        day: 2,
        title: 'Delhi to Jaipur',
        description: 'Travel to the Pink City of Jaipur',
        activities: [
          'Drive to Jaipur',
          'Visit City Palace',
          'Explore local markets',
        ],
        meals: ['Breakfast', 'Lunch', 'Dinner'],
        accommodation: 'Heritage hotel in Jaipur',
        images: [
          'https://20jpaobz2o.ucarecd.net/f7fa67a7-08e1-4e70-a2d6-81a790e7cc31/hawamahaljaipurrajasthancity1hero.jpg',
          'https://20jpaobz2o.ucarecd.net/e66dd2cd-a91c-4d52-8154-a1be73ec42a4/anantara_jewelbagh_jaipur_hotel_teaser_01_880x620.webp',
        ],
      },
      {
        day: 3,
        title: 'Jaipur Sightseeing',
        description: 'Explore the magnificent forts and palaces of Jaipur',
        activities: [
          'Visit Amber Fort',
          'Explore Jantar Mantar',
          'City Palace tour',
        ],
        meals: ['Breakfast', 'Lunch', 'Dinner'],
        accommodation: 'Heritage hotel in Jaipur',
        images: [
          'https://20jpaobz2o.ucarecd.net/30dc71d7-5e41-4d2f-8a97-d33da95546d0/m_activities_amber_fort_2_l_436_573.avif',
          'https://20jpaobz2o.ucarecd.net/ce425e4f-e3fa-45b6-afc6-1d40ecc8702d/Jantar_Mantar_New_Delhi_Misra_Yantra.jpg',
        ],
      },
    ],
  },
  {
    name: 'Tropical Paradise Getaway',
    destination: 'Maldives',
    duration: '7 days',
    price: 3200.0,
    description:
      'Relax and unwind in the pristine waters of the Maldives. Stay in overwater bungalows, enjoy world-class diving, and experience the ultimate luxury beach vacation with crystal-clear waters and white sandy beaches.',
    maxGuests: 8,
    category: 'luxury',
    status: 'published',
    thumbnail:
      'https://20jpaobz2o.ucarecd.net/4e7ba194-820a-4a8e-b9bb-1f7d3399203f/maldives.jpg',
    organizationDomain: 'initech.org',
    inclusions: [
      'Luxury overwater villa accommodation',
      'All meals and beverages',
      'Snorkeling equipment and lessons',
      'Spa treatment (60 minutes)',
      'Sunset dolphin watching cruise',
      'Airport transfers by seaplane',
      'Complimentary WiFi',
      'Daily housekeeping and turndown service',
    ],
    exclusions: [
      'International flights to/from Male',
      'Travel insurance',
      'Additional spa treatments',
      'Scuba diving (available at extra cost)',
      'Water sports activities',
      'Personal expenses and tips',
    ],
    paymentStructure: [
      {
        name: 'Initial Deposit',
        amount: 1280.0,
        description: '40% deposit to secure booking',
        dueDate: 'At time of booking',
      },
      {
        name: 'Final Payment',
        amount: 1920.0,
        description: 'Remaining balance due 30 days before trip',
        dueDate: '30 days before trip',
      },
    ],
    cancellationStructure: [
      {
        timeframe: '30+ days before departure',
        amount: 320.0,
        description: 'Administrative fee',
      },
      {
        timeframe: '15-29 days before departure',
        amount: 1280.0,
        description: '60% refund',
      },
      {
        timeframe: 'Less than 15 days',
        amount: 3200.0,
        description: 'No refund',
      },
    ],
    cancellationPolicy: [
      'All cancellations must be made in writing',
      'Refunds processed within 30 days',
      'Travel insurance recommended',
    ],
    documentRequirements: [
      {
        name: 'Valid Passport',
        description: 'Valid for 6 months beyond trip date',
        mandatory: true,
        applicableFor: 'all',
      },
      {
        name: 'Travel Insurance',
        description: 'Comprehensive travel insurance',
        mandatory: true,
        applicableFor: 'all',
      },
    ],
    preTripChecklist: [
      {
        task: 'Book flights',
        description: 'International flights to Male',
        category: 'booking',
        dueDate: '60 days before trip',
      },
      {
        task: 'Pack beachwear',
        description: 'Swimwear and beach essentials',
        category: 'preparation',
        dueDate: '7 days before trip',
      },
    ],
    mealsBreakdown: {
      breakfast: ['Continental breakfast', 'Fresh fruits', 'Coffee and tea'],
      lunch: [
        'International buffet',
        'Local Maldivian cuisine',
        'Fresh seafood',
      ],
      dinner: ['Gourmet dining', 'Beach BBQ', 'Fine dining options'],
    },
    packageLocation: {
      type: 'international',
      country: 'Maldives',
      state: null,
    },
    transportation: {
      toDestination: {
        mode: 'Flight',
        details: 'International flight to Male',
        included: false,
      },
      fromDestination: {
        mode: 'Flight',
        details: 'International flight from Male',
        included: false,
      },
      duringTrip: {
        mode: 'Seaplane',
        details: 'Seaplane transfers to resort',
        included: true,
      },
    },
    itinerary: [
      {
        day: 1,
        title: 'Arrival in Maldives',
        description: 'Arrive and transfer to resort',
        activities: ['Airport pickup', 'Seaplane transfer', 'Resort check-in'],
        meals: ['Dinner'],
        accommodation: 'Overwater villa',
        images: [
          'https://20jpaobz2o.ucarecd.net/3ea5d884-5701-4452-9c83-2441e71e970b/maldives_best_resort_kuramathi674x449.jpg',
        ],
      },
      {
        day: 2,
        title: 'Island Exploration',
        description: 'Explore the resort and nearby islands',
        activities: ['Snorkeling', 'Island hopping', 'Spa treatment'],
        meals: ['Breakfast', 'Lunch', 'Dinner'],
        accommodation: 'Overwater villa',
        images: [
          'https://20jpaobz2o.ucarecd.net/1ca99773-f90c-434a-9fdf-1e24487e2baf/snorkling.jpg',
          'https://20jpaobz2o.ucarecd.net/8316511f-2c12-4f7d-bf4a-90003bef9376/activemaldives_GettyImages86477634_HR.avif',
        ],
      },
    ],
  },
  {
    name: 'African Safari Adventure',
    destination: 'Kenya & Tanzania',
    duration: '12 days',
    price: 4500.0,
    description:
      'Embark on an unforgettable safari adventure through the Serengeti and Masai Mara. Witness the Great Migration, spot the Big Five, and experience the raw beauty of the African wilderness with expert guides.',
    maxGuests: 10,
    category: 'wildlife',
    status: 'published',
    thumbnail:
      'https://20jpaobz2o.ucarecd.net/3873e07d-a311-4c16-9f58-9e3f9a3449a7/african_safari.webp',
    organizationDomain: 'umbrella.com',
    inclusions: [
      'Professional safari guide and driver',
      'Luxury tented camp accommodation',
      'All meals and beverages',
      'Game drives in 4x4 vehicles',
      'Park entrance fees',
      'Hot air balloon safari (Serengeti)',
      'Cultural visit to Masai village',
      'Airport transfers',
    ],
    exclusions: [
      'International flights to/from Africa',
      'Travel insurance and vaccinations',
      'Visa fees',
      'Personal expenses and tips',
      'Optional activities',
      'Alcoholic beverages (limited selection included)',
    ],
    paymentStructure: [
      {
        name: 'Initial Deposit',
        amount: 1350.0,
        description: '30% deposit to secure booking',
        dueDate: 'At time of booking',
      },
      {
        name: 'Second Payment',
        amount: 1800.0,
        description: 'Due 90 days before departure',
        dueDate: '90 days before trip',
      },
      {
        name: 'Final Payment',
        amount: 1350.0,
        description: 'Remaining balance due 30 days before departure',
        dueDate: '30 days before trip',
      },
    ],
    cancellationStructure: [
      {
        timeframe: '90+ days before departure',
        amount: 450.0,
        description:
          'Administrative fee for cancellations 90+ days before departure',
      },
      {
        timeframe: '60-89 days before departure',
        amount: 1350.0,
        description: '70% refund for cancellations 60-89 days before departure',
      },
      {
        timeframe: '30-59 days before departure',
        amount: 2250.0,
        description: '50% refund for cancellations 30-59 days before departure',
      },
      {
        timeframe: 'Less than 30 days',
        amount: 4500.0,
        description:
          'No refund for cancellations less than 30 days before departure',
      },
    ],
    cancellationPolicy: [
      'All cancellations must be made in writing and acknowledged by our office',
      'Refunds will be processed within 30 days of cancellation request',
      'No refunds for unused services during the trip',
      'Travel insurance is mandatory for this trip',
    ],
    documentRequirements: [
      {
        name: 'Valid Passport',
        description:
          'Passport must be valid for at least 6 months beyond the trip end date',
        mandatory: true,
        applicableFor: 'all',
      },
      {
        name: 'Yellow Fever Certificate',
        description: 'Yellow fever vaccination certificate required',
        mandatory: true,
        applicableFor: 'all',
      },
      {
        name: 'Travel Insurance',
        description:
          'Comprehensive travel insurance covering safari activities',
        mandatory: true,
        applicableFor: 'all',
      },
      {
        name: 'Visa',
        description: 'Tourist visa for Kenya and Tanzania',
        mandatory: true,
        applicableFor: 'all',
      },
    ],
    preTripChecklist: [
      {
        task: 'Book international flights',
        description: 'Confirm flight bookings to Nairobi',
        category: 'booking',
        dueDate: '120 days before trip',
      },
      {
        task: 'Get yellow fever vaccination',
        description: 'Obtain yellow fever vaccination certificate',
        category: 'documents',
        dueDate: '90 days before trip',
      },
      {
        task: 'Apply for visas',
        description: 'Apply for Kenya and Tanzania tourist visas',
        category: 'documents',
        dueDate: '60 days before trip',
      },
      {
        task: 'Purchase travel insurance',
        description: 'Buy comprehensive travel insurance',
        category: 'documents',
        dueDate: '90 days before trip',
      },
      {
        task: 'Pack safari gear',
        description: 'Prepare safari clothing and equipment',
        category: 'preparation',
        dueDate: '14 days before trip',
      },
    ],
    mealsBreakdown: {
      breakfast: ['Continental breakfast', 'Fresh fruits', 'Coffee and tea'],
      lunch: ['Picnic lunch', 'Local cuisine', 'Fresh salads'],
      dinner: [
        'Three-course dinner',
        'Local specialties',
        'International options',
      ],
    },
    packageLocation: { type: 'international', country: 'Kenya', state: null },
    transportation: {
      toDestination: {
        mode: 'Flight',
        details: 'International flight to Nairobi',
        included: false,
      },
      fromDestination: {
        mode: 'Flight',
        details: 'International flight from Nairobi',
        included: false,
      },
      duringTrip: {
        mode: '4x4 Vehicle',
        details: 'Safari vehicles for game drives',
        included: true,
      },
    },
    itinerary: [
      {
        day: 1,
        title: 'Arrival in Nairobi',
        description: 'Arrive in Nairobi and transfer to hotel',
        activities: ['Airport pickup', 'Hotel check-in', 'Briefing'],
        meals: ['Dinner'],
        accommodation: 'Hotel in Nairobi',
        images: [
          'https://20jpaobz2o.ucarecd.net/3162ddc4-bd1a-4254-b753-29498374c249/Nairobi_Skyline1110x700.jpg',
          'https://20jpaobz2o.ucarecd.net/630dc1b3-2cb1-42f7-a2b6-f96e962dc8d2/image1732602254089630681340.png',
        ],
      },
      {
        day: 2,
        title: 'Masai Mara',
        description: 'Drive to Masai Mara and first game drive',
        activities: ['Drive to Masai Mara', 'Game drive', 'Cultural visit'],
        meals: ['Breakfast', 'Lunch', 'Dinner'],
        accommodation: 'Tented camp',
        images: [
          'https://20jpaobz2o.ucarecd.net/9c670c01-944a-47c6-a56c-865134a4e972/migrationrekerogo2africa.jpg',
          'https://20jpaobz2o.ucarecd.net/27e4ed35-2678-4fe2-af3a-9b3dba77e2f8/MasaiMaraSafarisTours.jpg',
        ],
      },
    ],
  },
  {
    name: 'European Grand Tour',
    destination: 'France, Italy, Spain',
    duration: '21 days',
    price: 3800.0,
    description:
      'Explore the best of Europe with this comprehensive tour covering France, Italy, and Spain. Visit iconic landmarks, taste world-class cuisine, and immerse yourself in the rich history and culture of these magnificent countries.',
    maxGuests: 20,
    category: 'cultural',
    status: 'published',
    thumbnail:
      'https://20jpaobz2o.ucarecd.net/b3862774-2d1d-455a-b60b-9f28fab85eed/europe.jpeg',
    organizationDomain: 'acme.com',
    inclusions: [
      'Professional multilingual tour guide',
      '4-star hotel accommodation',
      'Daily breakfast and selected meals',
      'Private coach transportation',
      'Entrance fees to major attractions',
      'Wine tasting in Tuscany',
      'Flamenco show in Seville',
      'Eiffel Tower skip-the-line tickets',
    ],
    exclusions: [
      'International flights to/from Europe',
      'Travel insurance',
      'Personal expenses and shopping',
      'Additional meals not specified',
      'Optional excursions',
      'Alcoholic beverages (except wine tasting)',
    ],
    paymentStructure: [
      {
        name: 'Initial Deposit',
        amount: 1140.0,
        description: '30% deposit to secure booking',
        dueDate: 'At time of booking',
      },
      {
        name: 'Second Payment',
        amount: 1520.0,
        description: 'Due 90 days before departure',
        dueDate: '90 days before trip',
      },
      {
        name: 'Final Payment',
        amount: 1140.0,
        description: 'Remaining balance due 30 days before departure',
        dueDate: '30 days before trip',
      },
    ],
    cancellationStructure: [
      {
        timeframe: '90+ days before departure',
        amount: 380.0,
        description:
          'Administrative fee for cancellations 90+ days before departure',
      },
      {
        timeframe: '60-89 days before departure',
        amount: 1140.0,
        description: '70% refund for cancellations 60-89 days before departure',
      },
      {
        timeframe: '30-59 days before departure',
        amount: 1900.0,
        description: '50% refund for cancellations 30-59 days before departure',
      },
      {
        timeframe: 'Less than 30 days',
        amount: 3800.0,
        description:
          'No refund for cancellations less than 30 days before departure',
      },
    ],
    cancellationPolicy: [
      'All cancellations must be made in writing and acknowledged by our office',
      'Refunds will be processed within 30 days of cancellation request',
      'No refunds for unused services during the trip',
      'Travel insurance is strongly recommended',
    ],
    documentRequirements: [
      {
        name: 'Valid Passport',
        description:
          'Passport must be valid for at least 6 months beyond the trip end date',
        mandatory: true,
        applicableFor: 'all',
      },
      {
        name: 'Schengen Visa',
        description: 'Schengen visa for European travel',
        mandatory: true,
        applicableFor: 'all',
      },
      {
        name: 'Travel Insurance',
        description:
          'Comprehensive travel insurance covering medical emergencies',
        mandatory: true,
        applicableFor: 'all',
      },
    ],
    preTripChecklist: [
      {
        task: 'Book international flights',
        description: 'Confirm flight bookings to Paris',
        category: 'booking',
        dueDate: '120 days before trip',
      },
      {
        task: 'Apply for Schengen visa',
        description: 'Complete Schengen visa application',
        category: 'documents',
        dueDate: '90 days before trip',
      },
      {
        task: 'Purchase travel insurance',
        description: 'Buy comprehensive travel insurance',
        category: 'documents',
        dueDate: '90 days before trip',
      },
      {
        task: 'Research European culture',
        description: 'Learn about European customs and etiquette',
        category: 'preparation',
        dueDate: '60 days before trip',
      },
      {
        task: 'Pack for multiple climates',
        description: 'Prepare clothing for different European climates',
        category: 'preparation',
        dueDate: '14 days before trip',
      },
    ],
    mealsBreakdown: {
      breakfast: ['Continental breakfast', 'Fresh pastries', 'Coffee and tea'],
      lunch: ['Local cuisine', 'Traditional dishes', 'Fresh salads'],
      dinner: ['Fine dining', 'Regional specialties', 'Wine pairings'],
    },
    packageLocation: { type: 'international', country: 'France', state: null },
    transportation: {
      toDestination: {
        mode: 'Flight',
        details: 'International flight to Paris',
        included: false,
      },
      fromDestination: {
        mode: 'Flight',
        details: 'International flight from Barcelona',
        included: false,
      },
      duringTrip: {
        mode: 'Coach',
        details: 'Private coach for all transfers',
        included: true,
      },
    },
    itinerary: [
      {
        day: 1,
        title: 'Arrival in Paris',
        description: 'Arrive in Paris and city orientation',
        activities: ['Airport pickup', 'Hotel check-in', 'City tour'],
        meals: ['Dinner'],
        accommodation: '4-star hotel in Paris',
        images: [
          'https://20jpaobz2o.ucarecd.net/e3f8787f-9f5e-43fc-b0ee-78e092ca8e5d/paris.avif',
        ],
      },
      {
        day: 2,
        title: 'Paris Sightseeing',
        description: 'Explore iconic Paris landmarks',
        activities: ['Eiffel Tower', 'Louvre Museum', 'Notre Dame'],
        meals: ['Breakfast', 'Lunch'],
        accommodation: '4-star hotel in Paris',
        images: [
          'https://20jpaobz2o.ucarecd.net/4500466c-2d2b-4542-a7f0-6530a298a635/paris1400x7883.jpg',
          'https://20jpaobz2o.ucarecd.net/f420a603-8e1b-4edf-ad02-fd918ef6a1c0/LouvreMuseum.webp',
          'https://20jpaobz2o.ucarecd.net/86c26015-3c2d-4c10-9c97-285bf2eb99dd/notredamedeparisannouncesreopeningdateandproposesconstroversialentrancefee_2.jpg',
        ],
      },
    ],
  },
  {
    name: 'Budget Backpacking Southeast Asia',
    destination: 'Thailand, Vietnam, Cambodia',
    duration: '18 days',
    price: 1200.0,
    description:
      'Discover the vibrant cultures and stunning landscapes of Southeast Asia on this budget-friendly backpacking adventure. From bustling cities to pristine beaches, experience the best of Thailand, Vietnam, and Cambodia.',
    maxGuests: 16,
    category: 'budget',
    status: 'published',
    thumbnail:
      'https://20jpaobz2o.ucarecd.net/9c835cbd-099e-4d62-b284-60774bfa95c6/souteastasia.jpg',
    organizationDomain: 'globex.co',
    inclusions: [
      'Experienced local guides',
      'Hostel and guesthouse accommodation',
      'Daily breakfast',
      'Local transportation (buses, trains)',
      'Entrance fees to major sites',
      'Cooking class in Thailand',
      'Halong Bay cruise',
      'Angkor Wat temple tour',
    ],
    exclusions: [
      'International flights to/from Asia',
      'Travel insurance',
      'Most meals (except breakfast)',
      'Personal expenses and shopping',
      'Optional activities',
      'Alcoholic beverages',
    ],
    paymentStructure: [
      {
        name: 'Initial Deposit',
        amount: 480.0,
        description: '40% deposit to secure booking',
        dueDate: 'At time of booking',
      },
      {
        name: 'Second Payment',
        amount: 360.0,
        description: 'Due 60 days before departure',
        dueDate: '60 days before trip',
      },
      {
        name: 'Final Payment',
        amount: 360.0,
        description: 'Remaining balance due 30 days before departure',
        dueDate: '30 days before trip',
      },
    ],
    cancellationStructure: [
      {
        timeframe: '60+ days before departure',
        amount: 120.0,
        description:
          'Administrative fee for cancellations 60+ days before departure',
      },
      {
        timeframe: '30-59 days before departure',
        amount: 480.0,
        description: '60% refund for cancellations 30-59 days before departure',
      },
      {
        timeframe: '15-29 days before departure',
        amount: 720.0,
        description: '40% refund for cancellations 15-29 days before departure',
      },
      {
        timeframe: 'Less than 15 days',
        amount: 1200.0,
        description:
          'No refund for cancellations less than 15 days before departure',
      },
    ],
    cancellationPolicy: [
      'All cancellations must be made in writing and acknowledged by our office',
      'Refunds will be processed within 30 days of cancellation request',
      'No refunds for unused services during the trip',
      'Travel insurance is strongly recommended',
    ],
    documentRequirements: [
      {
        name: 'Valid Passport',
        description:
          'Passport must be valid for at least 6 months beyond the trip end date',
        mandatory: true,
        applicableFor: 'all',
      },
      {
        name: 'Travel Insurance',
        description:
          'Comprehensive travel insurance covering backpacking activities',
        mandatory: true,
        applicableFor: 'all',
      },
      {
        name: 'Vaccination Records',
        description: 'Recommended vaccinations for Southeast Asia',
        mandatory: false,
        applicableFor: 'all',
      },
    ],
    preTripChecklist: [
      {
        task: 'Book international flights',
        description: 'Confirm flight bookings to Bangkok',
        category: 'booking',
        dueDate: '90 days before trip',
      },
      {
        task: 'Purchase travel insurance',
        description: 'Buy comprehensive travel insurance',
        category: 'documents',
        dueDate: '60 days before trip',
      },
      {
        task: 'Get vaccinations',
        description: 'Consult travel doctor for recommended vaccinations',
        category: 'preparation',
        dueDate: '90 days before trip',
      },
      {
        task: 'Pack backpacking gear',
        description: 'Prepare lightweight backpacking equipment',
        category: 'preparation',
        dueDate: '14 days before trip',
      },
      {
        task: 'Learn basic phrases',
        description: 'Learn basic phrases in Thai, Vietnamese, and Khmer',
        category: 'preparation',
        dueDate: '30 days before trip',
      },
    ],
    mealsBreakdown: {
      breakfast: [
        'Continental breakfast',
        'Local breakfast options',
        'Fresh fruits',
      ],
      lunch: ['Street food', 'Local cuisine', 'Budget-friendly options'],
      dinner: ['Local restaurants', 'Night market food', 'Traditional dishes'],
    },
    packageLocation: {
      type: 'international',
      country: 'Thailand',
      state: null,
    },
    transportation: {
      toDestination: {
        mode: 'Flight',
        details: 'International flight to Bangkok',
        included: false,
      },
      fromDestination: {
        mode: 'Flight',
        details: 'International flight from Phnom Penh',
        included: false,
      },
      duringTrip: {
        mode: 'Public Transport',
        details: 'Local buses, trains, and boats',
        included: true,
      },
    },
    itinerary: [
      {
        day: 1,
        title: 'Arrival in Bangkok',
        description: 'Arrive in Bangkok and explore the city',
        activities: ['Airport pickup', 'Hostel check-in', 'City exploration'],
        meals: ['Dinner'],
        accommodation: 'Hostel in Bangkok',
        images: [
          'https://20jpaobz2o.ucarecd.net/da14e805-d2c9-423d-b76c-be4591fee0f8/bb.jpg',
          'https://20jpaobz2o.ucarecd.net/dad16538-f443-4660-a8ab-f659d4aa7e28/Bangkok.jpg',
        ],
      },
      {
        day: 2,
        title: 'Bangkok Sightseeing',
        description: 'Explore temples and markets of Bangkok',
        activities: ['Visit Wat Pho', 'Grand Palace', 'Chatuchak Market'],
        meals: ['Breakfast', 'Lunch'],
        accommodation: 'Hostel in Bangkok',
        images: [
          'https://20jpaobz2o.ucarecd.net/a065a75e-cb72-4db6-bf16-08c5c49f5722/watpho3743.webp',
          'https://20jpaobz2o.ucarecd.net/14351ac3-02c2-481e-aec3-f1bca0eddf51/WatPhoTempleoftheRecliningBuddhaBangkokThailand.jpg',
        ],
      },
    ],
  },
];
