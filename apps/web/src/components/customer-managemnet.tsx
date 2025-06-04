import { useEffect, useState } from "react";
import type { Customer, Itinerary, Group } from ".../../web/src/lib/types";
import { generateSampleData } from ".../../api/src/seed/seeds/customer.seeds";

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
        <div className="Main div">
            <div className="Second main "></div>
        </div>
    );

}