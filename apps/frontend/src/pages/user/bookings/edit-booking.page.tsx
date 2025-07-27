import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  ArrowLeft,
  Plus,
  Save,
  Trash2,
  Loader2,
  AlertCircle,
  Users,
  Package,
  DollarSign,
} from "lucide-react";
import type React from "react";
import { useState, useEffect } from "react";
import { NavLink, useParams, useNavigate } from "react-router-dom";
import BookingService from "@/services/booking.service";
import type {
  IBooking,
  IUpdateBookingRequest,
  IBookingPassenger,
  BookingStatus,
  IPackage,
} from "@/types/booking.types";
import type { IBatches } from "@/types/batches.types";
import { toast } from "sonner";

export default function EditBookingPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [booking, setBooking] = useState<IBooking | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [packages, setPackages] = useState<IPackage[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [availableBatches, setAvailableBatches] = useState<IBatches[]>([]);

  const [formData, setFormData] = useState<{
    status: BookingStatus;
    totalAmount: number;
    specialRequests: string;
    passengers: IBookingPassenger[];
  }>({
    status: "pending",
    totalAmount: 0,
    specialRequests: "",
    passengers: [],
  });

  useEffect(() => {
    if (id) {
      loadBookingData();
      loadPackages();
    }
  }, [id]);

  const loadBookingData = async () => {
    if (!id) return;

    try {
      setLoading(true);
      setError(null);
      const bookingData = await BookingService.getBookingById(id);
      setBooking(bookingData);

      // Populate form with existing data
      setFormData({
        status: bookingData.status,
        totalAmount: bookingData.totalAmount,
        specialRequests: bookingData.specialRequests || "",
        passengers: bookingData.passengers,
      });
    } catch (err) {
      console.error("Error loading booking:", err);
      setError(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (err as any)?.response?.data?.message ||
          "Failed to load booking details."
      );
    } finally {
      setLoading(false);
    }
  };

  const loadPackages = async () => {
    try {
      const packagesData = await BookingService.getPackages();
      setPackages(packagesData);
    } catch (err) {
      console.error("Error loading packages:", err);
    }
  };

  const updatePassenger = (
    index: number,
    field: keyof IBookingPassenger,
    value: string | number
  ) => {
    const newPassengers = [...formData.passengers];
    newPassengers[index] = { ...newPassengers[index], [field]: value };
    setFormData((prev) => ({ ...prev, passengers: newPassengers }));
  };

  const addPassenger = () => {
    const newPassenger: IBookingPassenger = {
      fullName: "",
      age: 0,
      email: "",
      phone: "",
      emergencyContact: "",
      specialRequirements: "",
    };
    setFormData((prev) => ({
      ...prev,
      passengers: [...prev.passengers, newPassenger],
    }));
  };

  const removePassenger = (index: number) => {
    if (formData.passengers.length <= 1) {
      toast.error("At least one passenger is required");
      return;
    }

    const newPassengers = formData.passengers.filter((_, i) => i !== index);
    setFormData((prev) => ({ ...prev, passengers: newPassengers }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!booking || !id) return;

    try {
      setSaving(true);
      setError(null);

      // Validate passengers
      const invalidPassengers = formData.passengers.some(
        (p) => !p.fullName || !p.age || !p.emergencyContact
      );
      if (invalidPassengers) {
        setError(
          "Please fill in all required passenger details (Name, Age, Emergency Contact)"
        );
        return;
      }

      const updateData: IUpdateBookingRequest = {
        status: formData.status,
        totalAmount: formData.totalAmount,
        specialRequests: formData.specialRequests,
        passengers: formData.passengers,
      };

      const updatedBooking = await BookingService.updateBooking(id, updateData);

      toast.success("Booking updated successfully", {
        description: `Booking ${BookingService.formatBookingNumber(updatedBooking.bookingNumber)} has been updated.`,
      });

      // Navigate back to booking details
      navigate(`/bookings/${id}`);
    } catch (err) {
      console.error("Error updating booking:", err);
      setError(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (err as any)?.response?.data?.message ||
          "Failed to update booking. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center gap-4">
          <NavLink to={id ? `/bookings/${id}` : "/bookings"}>
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </NavLink>
        </div>
        <div className="flex items-center justify-center py-8">
          <div className="flex items-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Loading booking details...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error && !booking) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center gap-4">
          <NavLink to="/bookings">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Bookings
            </Button>
          </NavLink>
        </div>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error}
            <Button
              variant="outline"
              size="sm"
              className="ml-4"
              onClick={loadBookingData}
            >
              Try Again
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!booking) return null;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <NavLink to={`/bookings/${id}`}>
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Details
            </Button>
          </NavLink>
          <div>
            <h1 className="text-3xl font-bold">
              Edit Booking{" "}
              {BookingService.formatBookingNumber(booking.bookingNumber)}
            </h1>
            <p className="text-muted-foreground">
              Update booking information and passenger details
            </p>
          </div>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Customer Information (Read-only) */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Customer Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label>Customer Name</Label>
                <Input value={booking.customer.name} disabled />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input value={booking.customer.email} disabled />
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input value={booking.customer.phone} disabled />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Package Information (Read-only) */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              Package & Batch Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Package</Label>
                <Input value={booking.package.name} disabled />
                <p className="text-sm text-muted-foreground mt-1">
                  {BookingService.formatCurrency(booking.package.price)} per
                  person
                </p>
              </div>
              <div className="space-y-2">
                <Label>Batch Dates</Label>
                <Input
                  value={`${new Date(booking.batch.startDate).toLocaleDateString()} - ${new Date(booking.batch.endDate).toLocaleDateString()}`}
                  disabled
                />
                <p className="text-sm text-muted-foreground mt-1">
                  {booking.batch.bookedSeats} / {booking.batch.totalSeats} seats
                  booked
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Booking Status & Amount */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Booking Status & Amount
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="status">Booking Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: BookingStatus) =>
                    setFormData((prev) => ({ ...prev, status: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="totalAmount">Total Amount</Label>
                <Input
                  id="totalAmount"
                  type="number"
                  value={formData.totalAmount}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      totalAmount: Number.parseFloat(e.target.value) || 0,
                    }))
                  }
                  required
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Current balance:{" "}
                  {BookingService.formatCurrency(booking.balanceAmount)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Passenger Details */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Passenger Details ({formData.passengers.length})
              </CardTitle>
              <Button type="button" variant="outline" onClick={addPassenger}>
                <Plus className="w-4 h-4 mr-2" />
                Add Passenger
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {formData.passengers.map((passenger, index) => (
              <div key={index} className="p-4 border rounded-lg space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium">Passenger {index + 1}</h4>
                  {formData.passengers.length > 1 && (
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => removePassenger(index)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Full Name *</Label>
                    <Input
                      value={passenger.fullName}
                      onChange={(e) =>
                        updatePassenger(index, "fullName", e.target.value)
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Age *</Label>
                    <Input
                      type="number"
                      value={passenger.age || ""}
                      onChange={(e) =>
                        updatePassenger(
                          index,
                          "age",
                          Number.parseInt(e.target.value) || 0
                        )
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input
                      type="email"
                      value={passenger.email}
                      onChange={(e) =>
                        updatePassenger(index, "email", e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Phone</Label>
                    <Input
                      value={passenger.phone}
                      onChange={(e) =>
                        updatePassenger(index, "phone", e.target.value)
                      }
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Emergency Contact *</Label>
                  <Input
                    value={passenger.emergencyContact}
                    onChange={(e) =>
                      updatePassenger(index, "emergencyContact", e.target.value)
                    }
                    placeholder="Name and phone number"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Special Requirements</Label>
                  <Textarea
                    value={passenger.specialRequirements}
                    onChange={(e) =>
                      updatePassenger(
                        index,
                        "specialRequirements",
                        e.target.value
                      )
                    }
                    placeholder="Dietary restrictions, medical conditions, etc."
                    rows={2}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Special Requests */}
        <Card>
          <CardHeader>
            <CardTitle>Special Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={formData.specialRequests}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  specialRequests: e.target.value,
                }))
              }
              placeholder="Any special arrangements or requests..."
              rows={4}
            />
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-between">
          <NavLink to={`/bookings/${id}`}>
            <Button type="button" variant="outline" disabled={saving}>
              Cancel
            </Button>
          </NavLink>
          <Button type="submit" disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
