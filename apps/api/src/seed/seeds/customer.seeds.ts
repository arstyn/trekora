import type { Customer, Itinerary, Group } from "./types"

export function generateSampleData() {
  const customers: Customer[] = [
    {
      id: "c1",
      name: "John Smith",
      email: "john.smith@example.com",
      phone: "555-123-4567",
      address: "123 Main St, Anytown, USA",
      notes: "Prefers window seats on flights",
      status: "active",
    },
    {
      id: "c2",
      name: "Sarah Johnson",
      email: "sarah.j@example.com",
      phone: "555-987-6543",
      address: "456 Oak Ave, Somewhere, USA",
      notes: "Vegetarian meals",
      status: "active",
    },
    {
      id: "c3",
      name: "Michael Brown",
      email: "mbrown@example.com",
      phone: "555-456-7890",
      address: "789 Pine Rd, Elsewhere, USA",
      status: "inactive",
    },
    {
      id: "c4",
      name: "Emily Davis",
      email: "emily.davis@example.com",
      phone: "555-789-0123",
      address: "321 Elm St, Nowhere, USA",
      notes: "Frequent traveler, gold member",
      status: "active",
    },
  ]

  const itineraries: Itinerary[] = [
    {
      id: "i1",
      customerId: "c1",
      destination: "Paris, France",
      startDate: "2025-07-15",
      endDate: "2025-07-22",
      description: "Summer vacation in Paris with Eiffel Tower tour and Seine river cruise",
      status: "upcoming",
      totalCost: 2500,
    },
    {
      id: "i2",
      customerId: "c2",
      destination: "Tokyo, Japan",
      startDate: "2025-08-10",
      endDate: "2025-08-20",
      description: "Cultural tour of Tokyo with Mt. Fuji day trip",
      status: "upcoming",
      totalCost: 3200,
    },
    {
      id: "i3",
      customerId: "c4",
      destination: "Cancun, Mexico",
      startDate: "2025-06-05",
      endDate: "2025-06-12",
      description: "All-inclusive beach resort stay",
      status: "completed",
      totalCost: 1800,
    },
    {
      id: "i4",
      customerId: "c3",
      destination: "New York City, USA",
      startDate: "2025-09-20",
      endDate: "2025-09-25",
      description: "Business trip with Broadway show",
      status: "cancelled",
      totalCost: 1500,
    },
  ]

  const groups: Group[] = [
    {
      id: "g1",
      name: "Smith Family Vacation",
      type: "Family",
      memberIds: ["c1", "c4"],
    },
    {
      id: "g2",
      name: "Corporate Retreat 2025",
      type: "Business",
      memberIds: ["c2", "c3"],
    },
  ]

  return { customers, itineraries, groups }
}
