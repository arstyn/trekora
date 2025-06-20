"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Edit, MoreHorizontal, PlusCircle, Trash2 } from "lucide-react"
import type { Customer, Itinerary } from "@/lib/types"

interface ItineraryViewProps {
  itineraries: Itinerary[]
  customers: Customer[]
  onAdd: (itinerary: Itinerary) => void
  onUpdate: (itinerary: Itinerary) => void
  onDelete: (itineraryId: string) => void
}

export default function ItineraryView({ itineraries, customers, onAdd, onUpdate, onDelete }: ItineraryViewProps) {
  const [isAddingItinerary, setIsAddingItinerary] = useState(false)
  const [selectedItinerary, setSelectedItinerary] = useState<Itinerary | null>(null)
  const [itineraryToDelete, setItineraryToDelete] = useState<Itinerary | null>(null)
  const [formData, setFormData] = useState<Itinerary>({
    id: "",
    customerId: "",
    destination: "",
    startDate: "",
    endDate: "",
    description: "",
    status: "upcoming",
    totalCost: 0,
  })

  const handleOpenAddForm = () => {
    setFormData({
      id: "",
      customerId: "",
      destination: "",
      startDate: "",
      endDate: "",
      description: "",
      status: "upcoming",
      totalCost: 0,
    })
    setIsAddingItinerary(true)
  }

  const handleOpenEditForm = (itinerary: Itinerary) => {
    setFormData(itinerary)
    setSelectedItinerary(itinerary)
  }

  const handleCloseForm = () => {
    setIsAddingItinerary(false)
    setSelectedItinerary(null)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: name === "totalCost" ? Number.parseFloat(value) || 0 : value,
    })
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData({ ...formData, [name]: value })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (selectedItinerary) {
      onUpdate(formData)
    } else {
      onAdd(formData)
    }
    handleCloseForm()
  }

  const confirmDelete = (itinerary: Itinerary) => {
    setItineraryToDelete(itinerary)
  }

  const handleDelete = () => {
    if (itineraryToDelete) {
      onDelete(itineraryToDelete.id)
      setItineraryToDelete(null)
    }
  }

  const getCustomerName = (customerId: string) => {
    const customer = customers.find((c) => c.id === customerId)
    return customer ? customer.name : "Unknown Customer"
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "upcoming":
        return "default"
      case "active":
        return "success"
      case "completed":
        return "secondary"
      case "cancelled":
        return "destructive"
      default:
        return "outline"
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Itineraries</CardTitle>
          <CardDescription>Manage customer travel itineraries and bookings.</CardDescription>
        </div>
        <Button onClick={handleOpenAddForm}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Itinerary
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead>Destination</TableHead>
              <TableHead>Dates</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Total Cost</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {itineraries.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">
                  No itineraries found. Add a new itinerary to get started.
                </TableCell>
              </TableRow>
            ) : (
              itineraries.map((itinerary) => (
                <TableRow key={itinerary.id}>
                  <TableCell className="font-medium">{getCustomerName(itinerary.customerId)}</TableCell>
                  <TableCell>{itinerary.destination}</TableCell>
                  <TableCell>
                    {itinerary.startDate} - {itinerary.endDate}
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(itinerary.status)}>{itinerary.status}</Badge>
                  </TableCell>
                  <TableCell>${itinerary.totalCost.toFixed(2)}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleOpenEditForm(itinerary)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => confirmDelete(itinerary)}>
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        <Dialog open={isAddingItinerary || !!selectedItinerary} onOpenChange={handleCloseForm}>
          <DialogContent className="sm:max-w-[500px]">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>{selectedItinerary ? "Edit Itinerary" : "Add New Itinerary"}</DialogTitle>
                <DialogDescription>
                  {selectedItinerary
                    ? "Update itinerary details for this customer."
                    : "Create a new travel itinerary for a customer."}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="customerId">Customer</Label>
                  <Select
                    value={formData.customerId}
                    onValueChange={(value) => handleSelectChange("customerId", value)}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select customer" />
                    </SelectTrigger>
                    <SelectContent>
                      {customers.map((customer) => (
                        <SelectItem key={customer.id} value={customer.id}>
                          {customer.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="destination">Destination</Label>
                  <Input
                    id="destination"
                    name="destination"
                    value={formData.destination}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="startDate">Start Date</Label>
                    <Input
                      id="startDate"
                      name="startDate"
                      type="date"
                      value={formData.startDate}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="endDate">End Date</Label>
                    <Input
                      id="endDate"
                      name="endDate"
                      type="date"
                      value={formData.endDate}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="status">Status</Label>
                    <Select value={formData.status} onValueChange={(value) => handleSelectChange("status", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="upcoming">Upcoming</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="totalCost">Total Cost ($)</Label>
                    <Input
                      id="totalCost"
                      name="totalCost"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.totalCost}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={3}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={handleCloseForm}>
                  Cancel
                </Button>
                <Button type="submit">{selectedItinerary ? "Update Itinerary" : "Add Itinerary"}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        <AlertDialog open={!!itineraryToDelete} onOpenChange={(open) => !open && setItineraryToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete this itinerary. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  )
}
