"use client";
import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { Customer, Itinerary, Group } from ".../../web/src/lib/types";
import { generateSampleData } from "../../../api/src/seed/seeds/customer.seeds";
import { Input } from "./ui/input";

export default function CustomerManagement() {
    const [customers, setCustomers] = useState<Customer[]>([])
    const [itineraries, setItineraries] = useState<Itinerary[]>([])
    const [groups, setGroups] = useState<Group[]>([])
    const [searchQuery, setSearchQuery] = useState("")
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
    const [isAddingCustomer, setIsAddingCustomer] = useState(false);
    const [isViewingItinerary, setIsViewingItinerary] = useState(false)
    const [activeTab, setActiveTab] = useState("customers")

    useEffect(() => {
        const data = generateSampleData();
        setCustomers(data.customers);
        setItineraries(data.itineraries);
        setGroups(data.groups);
    }, [])

    const filtedredCustomers = customers.filter(customer =>
        customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.phone.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleAddCustomer = (newCustomer: Customer) => {
        setCustomers([...customers, { ...newCustomer, id: Date.now().toString() }])
        setIsAddingCustomer(false)
    }

    return (
        <div className="Main div y-6 ">
            <div className="flex  flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">

                <div>
                    <h1 className="Main Heading  font-bold tracking-tigh">Trekora</h1>
                    <p className="Sub heading ">This is the subheading </p>
                </div>
                <div className="flex items-center space-x-2">
                    <div className="relative">
                        <search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="Search"
                            placeholder="Search customers"
                            className="w-full pl-8 md:w-[200px] lg:w-[300px]"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div style={{ padding: "16px" }}>
                        <button
                            className="btn"
                            style={{
                                backgroundColor: "#FFFFFFF",
                                padding: "8px 16px",
                                border: "none",
                                borderRadius: "4px",
                                cursor: "pointer"
                            }}
                            disabled={isAddingCustomer}
                            onClick={() => setIsAddingCustomer(true)}
                        >
                            Add Customers
                        </button>
                    </div>
                </div>


                <Tabs defaultValue="customers" value={activeTab} onValueChange={setActiveTab}>
                

                </Tabs>

            </div>
        </div>
    );

}