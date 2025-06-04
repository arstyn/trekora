import { useState } from "react";
import type { Customer, Itinerary, Group } from ".../../web/src/lib/types";

export default function CustomerManagement() {
    const [customers, setCustomers] = useState<Customer[]>([])
    const [itineraries, setItineraries] = useState<Itinerary[]>([])
    const [groups, setGroups] = useState<Group[]>([])
    const [searchQuery, setSearchQuery] = useState("")
    
}