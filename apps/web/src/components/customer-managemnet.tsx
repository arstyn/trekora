"use client"

import { useState, useEffect } from "react"
import { PlusCircle, Search, Users, Calendar, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import CustomerList from "@/components/customer-list"
import CustomerForm from "@/components/customer-form"
import ItineraryView from "@/components/itineray-view"
import GroupManagement from "@/components/group-management"
import type { Customer, Itinerary, Group } from "@/lib/types"
import { generateSampleData } from "@/app/"

export default function CustomerManagement() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [itineraries, setItineraries] = useState<Itinerary[]>([])
  const [groups, setGroups] = useState<Group[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [isAddingCustomer, setIsAddingCustomer] = useState(false)
  const [isViewingItinerary, setIsViewingItinerary] = useState(false)
  const [activeTab, setActiveTab] = useState("customers")

  // Load sample data
  useEffect(() => {
    const data = generateSampleData()
    setCustomers(data.customers)
    setItineraries(data.itineraries)
    setGroups(data.groups)
  }, [])

  const filteredCustomers = customers.filter(
    (customer) =>
      customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleAddCustomer = (newCustomer: Customer) => {
    setCustomers([...customers, { ...newCustomer, id: Date.now().toString() }])
    setIsAddingCustomer(false)
  }

  const handleUpdateCustomer = (updatedCustomer: Customer) => {
    setCustomers(customers.map((c) => (c.id === updatedCustomer.id ? updatedCustomer : c)))
    setSelectedCustomer(null)
  }

  const handleDeleteCustomer = (customerId: string) => {
    // Delete customer
    setCustomers(customers.filter((c) => c.id !== customerId))

    // Cancel all associated itineraries
    setItineraries(
      itineraries.map((itinerary) =>
        itinerary.customerId === customerId ? { ...itinerary, status: "cancelled" } : itinerary,
      ),
    )

    // Remove from all groups
    setGroups(
      groups.map((group) => ({
        ...group,
        memberIds: group.memberIds.filter((id) => id !== customerId),
      })),
    )

    setSelectedCustomer(null)
  }

  const handleAddItinerary = (newItinerary: Itinerary) => {
    setItineraries([...itineraries, { ...newItinerary, id: Date.now().toString() }])
  }

  const handleUpdateItinerary = (updatedItinerary: Itinerary) => {
    setItineraries(itineraries.map((i) => (i.id === updatedItinerary.id ? updatedItinerary : i)))
  }

  const handleDeleteItinerary = (itineraryId: string) => {
    setItineraries(itineraries.filter((i) => i.id !== itineraryId))
  }

  const handleAddGroup = (newGroup: Group) => {
    setGroups([...groups, { ...newGroup, id: Date.now().toString() }])
  }

  const handleUpdateGroup = (updatedGroup: Group) => {
    setGroups(groups.map((g) => (g.id === updatedGroup.id ? updatedGroup : g)))
  }

  const handleDeleteGroup = (groupId: string) => {
    setGroups(groups.filter((g) => g.id !== groupId))
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Travel Agency CMS</h1>
          <p className="text-muted-foreground">Manage customers, itineraries, and group bookings</p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search customers..."
              className="w-full pl-8 md:w-[200px] lg:w-[300px]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button onClick={() => setIsAddingCustomer(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Customer
          </Button>
        </div>
      </div>

      <Tabs defaultValue="customers" value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="customers">
            <Users className="mr-2 h-4 w-4" />
            Customers
          </TabsTrigger>
          <TabsTrigger value="itineraries">
            <Calendar className="mr-2 h-4 w-4" />
            Itineraries
          </TabsTrigger>
          <TabsTrigger value="groups">
            <MapPin className="mr-2 h-4 w-4" />
            Groups
          </TabsTrigger>
        </TabsList>

        <TabsContent value="customers" className="space-y-4">
          <CustomerList customers={filteredCustomers} onSelect={setSelectedCustomer} onDelete={handleDeleteCustomer} />
        </TabsContent>

        <TabsContent value="itineraries" className="space-y-4">
          <ItineraryView
            itineraries={itineraries}
            customers={customers}
            onAdd={handleAddItinerary}
            onUpdate={handleUpdateItinerary}
            onDelete={handleDeleteItinerary}
          />
        </TabsContent>

        <TabsContent value="groups" className="space-y-4">
          <GroupManagement
            groups={groups}
            customers={customers}
            onAdd={handleAddGroup}
            onUpdate={handleUpdateGroup}
            onDelete={handleDeleteGroup}
          />
        </TabsContent>
      </Tabs>

      {isAddingCustomer && <CustomerForm onSave={handleAddCustomer} onCancel={() => setIsAddingCustomer(false)} />}

      {selectedCustomer && (
        <CustomerForm
          customer={selectedCustomer}
          onSave={handleUpdateCustomer}
          onCancel={() => setSelectedCustomer(null)}
        />
      )}
    </div>
  )
}
