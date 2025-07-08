'use client';

import type React from 'react';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, Plus, Trash2, Save, Eye, Upload, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface PaymentMilestone {
  id: string;
  name: string;
  percentage: number;
  description: string;
  dueDate: string; // e.g., "booking", "2_weeks_before", "1_week_before"
}

interface CancellationTier {
  id: string;
  timeframe: string;
  percentage: number;
  description: string;
}

interface MealsBreakdown {
  breakfast: string[];
  lunch: string[];
  dinner: string[];
}

interface Transportation {
  toDestination: {
    mode: string; // flight, train, bus, car
    details: string;
    included: boolean;
  };
  fromDestination: {
    mode: string;
    details: string;
    included: boolean;
  };
  duringTrip: {
    mode: string;
    details: string;
    included: boolean;
  };
}

interface ItineraryDay {
  day: number;
  title: string;
  description: string;
  activities: string[];
  meals: string[];
  accommodation: string;
  images: string[];
}

interface DocumentRequirement {
  id: string;
  name: string;
  description: string;
  mandatory: boolean;
  applicableFor: 'adults' | 'children' | 'all';
}

interface ChecklistItem {
  id: string;
  task: string;
  description: string;
  category: 'documents' | 'booking' | 'preparation' | 'communication';
  dueDate: string; // e.g., "30_days_before", "1_week_before"
  completed: boolean;
}

interface PackageLocation {
  type: 'international' | 'local';
  country: string;
  state?: string;
}

export default function CreatePackagePage() {
  const [thumbnail, setThumbnail] = useState('');

  // Image upload handlers
  const handleThumbnailUpload = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setThumbnail(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDayImageUpload = (
    dayIndex: number,
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      setItinerary((prev) => {
        // Bail out if the index is invalid
        if (!prev[dayIndex]) return prev;

        // Copy‑on‑write update
        const updated = [...prev];
        updated[dayIndex] = {
          ...prev[dayIndex],
          images: [...prev[dayIndex].images, e.target?.result as string],
        };
        return updated;
      });
    };
    reader.readAsDataURL(file);
  };

  const removeDayImage = (dayIndex: number, imageIndex: number) => {
    setItinerary((prev) => {
      // Make sure the day exists
      const day = prev[dayIndex];
      if (!day) return prev; // invalid dayIndex — do nothing

      // Copy‑on‑write update
      const updatedDay: ItineraryDay = {
        ...day,
        images: day.images.filter((_, i) => i !== imageIndex),
      };

      const next = [...prev];
      next[dayIndex] = updatedDay;
      return next;
    });
  };

  const [packageData, setPackageData] = useState({
    name: '',
    destination: '',
    duration: '',
    price: '',
    description: '',
    maxGuests: '',
    startDate: '',
    endDate: '',
    difficulty: '',
    category: '',
    inclusions: [] as string[],
    exclusions: [] as string[],
    status: 'draft',
  });

  const [itinerary, setItinerary] = useState<ItineraryDay[]>([
    {
      day: 1,
      title: '',
      description: '',
      activities: [''],
      meals: [],
      accommodation: '',
      images: [],
    },
  ]);

  const [newInclusion, setNewInclusion] = useState('');
  const [newExclusion, setNewExclusion] = useState('');

  const [paymentStructure, setPaymentStructure] = useState<PaymentMilestone[]>([
    {
      id: '1',
      name: 'Booking Advance',
      percentage: 10,
      description: 'Initial booking amount',
      dueDate: 'booking',
    },
    {
      id: '2',
      name: 'Confirmation',
      percentage: 40,
      description: 'Confirmation payment',
      dueDate: '30_days_before',
    },
    {
      id: '3',
      name: 'Pre-departure',
      percentage: 50,
      description: 'Final payment',
      dueDate: '2_weeks_before',
    },
  ]);

  const [cancellationStructure, setCancellationStructure] = useState<
    CancellationTier[]
  >([
    {
      id: '1',
      timeframe: '30+ days before',
      percentage: 10,
      description: 'Minimal cancellation fee',
    },
    {
      id: '2',
      timeframe: '15-29 days before',
      percentage: 25,
      description: 'Standard cancellation fee',
    },
    {
      id: '3',
      timeframe: '7-14 days before',
      percentage: 50,
      description: 'High cancellation fee',
    },
    {
      id: '4',
      timeframe: 'Less than 7 days',
      percentage: 100,
      description: 'No refund',
    },
  ]);

  const [cancellationPolicy, setCancellationPolicy] = useState<string[]>([
    'Cancellation must be made in writing',
    'Refunds will be processed within 7-10 business days',
    'Travel insurance is recommended',
  ]);

  const [mealsBreakdown, setMealsBreakdown] = useState<MealsBreakdown>({
    breakfast: ['Continental breakfast', 'Fresh fruits', 'Coffee/Tea'],
    lunch: ['Local cuisine', 'Vegetarian options available'],
    dinner: ['3-course dinner', 'Local specialties', 'Beverages included'],
  });

  const [transportation, setTransportation] = useState<Transportation>({
    toDestination: { mode: 'flight', details: '', included: false },
    fromDestination: { mode: 'flight', details: '', included: false },
    duringTrip: { mode: 'bus', details: '', included: true },
  });

  const [documentRequirements, setDocumentRequirements] = useState<
    DocumentRequirement[]
  >([
    {
      id: '1',
      name: 'Valid Passport',
      description: 'Passport valid for at least 6 months',
      mandatory: true,
      applicableFor: 'all',
    },
    {
      id: '2',
      name: 'Visa',
      description: 'Tourist visa for destination country',
      mandatory: true,
      applicableFor: 'all',
    },
  ]);

  const [preTripChecklist, setPreTripChecklist] = useState<ChecklistItem[]>([
    {
      id: '1',
      task: 'Collect all documents',
      description: 'Verify all required documents are collected',
      category: 'documents',
      dueDate: '2_weeks_before',
      completed: false,
    },
    {
      id: '2',
      task: 'Confirm bookings',
      description: 'Confirm all hotel and transport bookings',
      category: 'booking',
      dueDate: '1_week_before',
      completed: false,
    },
  ]);

  const [packageLocation, setPackageLocation] = useState<PackageLocation>({
    type: 'international',
    country: '',
    state: '',
  });

  const addItineraryDay = () => {
    setItinerary([
      ...itinerary,
      {
        day: itinerary.length + 1,
        title: '',
        description: '',
        activities: [''],
        meals: [],
        accommodation: '',
        images: [],
      },
    ]);
  };

  const removeItineraryDay = (index: number) => {
    const newItinerary = itinerary.filter((_, i) => i !== index);
    // Renumber days
    const renumbered = newItinerary.map((day, i) => ({ ...day, day: i + 1 }));
    setItinerary(renumbered);
  };

  const updateItineraryDay = (
    index: number,
    field: keyof ItineraryDay,
    value: any,
  ) => {
    setItinerary((prev) => {
      if (!prev[index]) return prev;

      const updated = [...prev];
      updated[index] = { ...prev[index], [field]: value };
      return updated;
    });
  };

  const addActivity = (dayIndex: number) => {
    setItinerary((prev) => {
      if (!prev[dayIndex]) return prev;

      const updated = [...prev];
      updated[dayIndex] = {
        ...prev[dayIndex],
        activities: [...prev[dayIndex].activities, ''],
      };
      return updated;
    });
  };

  const updateActivity = (
    dayIndex: number,
    activityIndex: number,
    value: string,
  ) => {
    setItinerary((prev) => {
      const day = prev[dayIndex];
      if (!day || !day.activities[activityIndex]) return prev;

      const updatedActivities = [...day.activities];
      updatedActivities[activityIndex] = value;

      const updated = [...prev];
      updated[dayIndex] = { ...day, activities: updatedActivities };

      return updated;
    });
  };

  const removeActivity = (dayIndex: number, activityIndex: number) => {
    setItinerary((prev) => {
      const day = prev[dayIndex];
      if (!day) return prev;

      const updated = [...prev];
      updated[dayIndex] = {
        ...day,
        activities: day.activities.filter((_, i) => i !== activityIndex),
      };

      return updated;
    });
  };

  const addInclusion = () => {
    if (newInclusion.trim()) {
      setPackageData({
        ...packageData,
        inclusions: [...packageData.inclusions, newInclusion.trim()],
      });
      setNewInclusion('');
    }
  };

  const removeInclusion = (index: number) => {
    setPackageData({
      ...packageData,
      inclusions: packageData.inclusions.filter((_, i) => i !== index),
    });
  };

  const addExclusion = () => {
    if (newExclusion.trim()) {
      setPackageData({
        ...packageData,
        exclusions: [...packageData.exclusions, newExclusion.trim()],
      });
      setNewExclusion('');
    }
  };

  const removeExclusion = (index: number) => {
    setPackageData({
      ...packageData,
      exclusions: packageData.exclusions.filter((_, i) => i !== index),
    });
  };

  const addPaymentMilestone = () => {
    const newId = Date.now().toString();
    setPaymentStructure([
      ...paymentStructure,
      {
        id: newId,
        name: '',
        percentage: 0,
        description: '',
        dueDate: 'booking',
      },
    ]);
  };

  const updatePaymentMilestone = (
    id: string,
    field: keyof PaymentMilestone,
    value: any,
  ) => {
    setPaymentStructure(
      paymentStructure.map((milestone) =>
        milestone.id === id ? { ...milestone, [field]: value } : milestone,
      ),
    );
  };

  const removePaymentMilestone = (id: string) => {
    setPaymentStructure(
      paymentStructure.filter((milestone) => milestone.id !== id),
    );
  };

  const getTotalPaymentPercentage = () => {
    return paymentStructure.reduce(
      (total, milestone) => total + milestone.percentage,
      0,
    );
  };

  const addCancellationTier = () => {
    const newId = Date.now().toString();
    setCancellationStructure([
      ...cancellationStructure,
      {
        id: newId,
        timeframe: '',
        percentage: 0,
        description: '',
      },
    ]);
  };

  const updateCancellationTier = (
    id: string,
    field: keyof CancellationTier,
    value: any,
  ) => {
    setCancellationStructure(
      cancellationStructure.map((tier) =>
        tier.id === id ? { ...tier, [field]: value } : tier,
      ),
    );
  };

  const removeCancellationTier = (id: string) => {
    setCancellationStructure(
      cancellationStructure.filter((tier) => tier.id !== id),
    );
  };

  const addCancellationPolicyPoint = () => {
    setCancellationPolicy([...cancellationPolicy, '']);
  };

  const updateCancellationPolicyPoint = (index: number, value: string) => {
    const newPolicy = [...cancellationPolicy];
    newPolicy[index] = value;
    setCancellationPolicy(newPolicy);
  };

  const removeCancellationPolicyPoint = (index: number) => {
    setCancellationPolicy(cancellationPolicy.filter((_, i) => i !== index));
  };

  const addMealItem = (mealType: keyof MealsBreakdown) => {
    setMealsBreakdown({
      ...mealsBreakdown,
      [mealType]: [...mealsBreakdown[mealType], ''],
    });
  };

  const updateMealItem = (
    mealType: keyof MealsBreakdown,
    index: number,
    value: string,
  ) => {
    const newMeals = { ...mealsBreakdown };
    newMeals[mealType][index] = value;
    setMealsBreakdown(newMeals);
  };

  const removeMealItem = (mealType: keyof MealsBreakdown, index: number) => {
    setMealsBreakdown({
      ...mealsBreakdown,
      [mealType]: mealsBreakdown[mealType].filter((_, i) => i !== index),
    });
  };

  const addDocumentRequirement = () => {
    const newId = Date.now().toString();
    setDocumentRequirements([
      ...documentRequirements,
      {
        id: newId,
        name: '',
        description: '',
        mandatory: true,
        applicableFor: 'all',
      },
    ]);
  };

  const updateDocumentRequirement = (
    id: string,
    field: keyof DocumentRequirement,
    value: any,
  ) => {
    setDocumentRequirements(
      documentRequirements.map((doc) =>
        doc.id === id ? { ...doc, [field]: value } : doc,
      ),
    );
  };

  const removeDocumentRequirement = (id: string) => {
    setDocumentRequirements(
      documentRequirements.filter((doc) => doc.id !== id),
    );
  };

  const addChecklistItem = () => {
    const newId = Date.now().toString();
    setPreTripChecklist([
      ...preTripChecklist,
      {
        id: newId,
        task: '',
        description: '',
        category: 'preparation',
        dueDate: '1_week_before',
        completed: false,
      },
    ]);
  };

  const updateChecklistItem = (
    id: string,
    field: keyof ChecklistItem,
    value: any,
  ) => {
    setPreTripChecklist(
      preTripChecklist.map((item) =>
        item.id === id ? { ...item, [field]: value } : item,
      ),
    );
  };

  const removeChecklistItem = (id: string) => {
    setPreTripChecklist(preTripChecklist.filter((item) => item.id !== id));
  };

  const addDocumentsToChecklist = () => {
    const documentTasks = documentRequirements.map((doc) => ({
      id: `doc-${doc.id}-${Date.now()}`,
      task: `Collect ${doc.name}`,
      description: doc.description,
      category: 'documents' as const,
      dueDate: '2_weeks_before',
      completed: false,
    }));

    setPreTripChecklist([...preTripChecklist, ...documentTasks]);
  };

  const indianStates = [
    'Andhra Pradesh',
    'Arunachal Pradesh',
    'Assam',
    'Bihar',
    'Chhattisgarh',
    'Goa',
    'Gujarat',
    'Haryana',
    'Himachal Pradesh',
    'Jharkhand',
    'Karnataka',
    'Kerala',
    'Madhya Pradesh',
    'Maharashtra',
    'Manipur',
    'Meghalaya',
    'Mizoram',
    'Nagaland',
    'Odisha',
    'Punjab',
    'Rajasthan',
    'Sikkim',
    'Tamil Nadu',
    'Telangana',
    'Tripura',
    'Uttar Pradesh',
    'Uttarakhand',
    'West Bengal',
    'Delhi',
    'Jammu and Kashmir',
    'Ladakh',
  ];

  const handleSave = (status: 'draft' | 'published') => {
    // Validate payment structure
    if (getTotalPaymentPercentage() !== 100) {
      alert('Payment structure must total exactly 100%');
      return;
    }

    const finalData = {
      ...packageData,
      status,
      thumbnail,
      itinerary,
      paymentStructure,
      cancellationStructure,
      cancellationPolicy,
      mealsBreakdown,
      transportation,
      documentRequirements,
      preTripChecklist,
      packageLocation,
    };
    console.log('Saving package:', finalData);
    alert(`Package saved as ${status}!`);
  };

  return (
    <div className="min-h-screen ">
      {/* Header */}
      <header className="shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold">Create New Package</h1>
              <p className="">Fill in all the details for your tour package</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => handleSave('draft')}>
                <Save className="w-4 h-4 mr-2" />
                Save as Draft
              </Button>
              <Button onClick={() => handleSave('published')}>
                <Eye className="w-4 h-4 mr-2" />
                Publish Package
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Package Thumbnail */}
            <Card>
              <CardHeader>
                <CardTitle>Package Thumbnail</CardTitle>
                <CardDescription>
                  Upload a main image for your package
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <Image
                      src={thumbnail || '/placeholder.svg'}
                      alt="Package thumbnail"
                      width={200}
                      height={150}
                      className="rounded-lg object-cover border"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="thumbnail">Upload Thumbnail</Label>
                    <Input
                      id="thumbnail"
                      type="file"
                      accept="image/*"
                      onChange={handleThumbnailUpload}
                      className="w-full"
                    />
                    <p className="text-sm ">
                      Recommended: 400x300px, JPG or PNG
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>
                  Enter the basic details of your tour package
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Package Name</Label>
                    <Input
                      id="name"
                      placeholder="e.g., Bali Paradise Getaway"
                      value={packageData.name}
                      onChange={(e) =>
                        setPackageData({ ...packageData, name: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="destination">Destination</Label>
                    <Input
                      id="destination"
                      placeholder="e.g., Bali, Indonesia"
                      value={packageData.destination}
                      onChange={(e) =>
                        setPackageData({
                          ...packageData,
                          destination: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe your tour package..."
                    className="min-h-[100px]"
                    value={packageData.description}
                    onChange={(e) =>
                      setPackageData({
                        ...packageData,
                        description: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="duration">Duration</Label>
                    <Input
                      id="duration"
                      placeholder="e.g., 7 Days, 6 Nights"
                      value={packageData.duration}
                      onChange={(e) =>
                        setPackageData({
                          ...packageData,
                          duration: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="price">Price (USD)</Label>
                    <Input
                      id="price"
                      type="number"
                      placeholder="1299"
                      value={packageData.price}
                      onChange={(e) =>
                        setPackageData({
                          ...packageData,
                          price: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maxGuests">Max Guests</Label>
                    <Input
                      id="maxGuests"
                      type="number"
                      placeholder="12"
                      value={packageData.maxGuests}
                      onChange={(e) =>
                        setPackageData({
                          ...packageData,
                          maxGuests: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startDate">Start Date</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={packageData.startDate}
                      onChange={(e) =>
                        setPackageData({
                          ...packageData,
                          startDate: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endDate">End Date</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={packageData.endDate}
                      onChange={(e) =>
                        setPackageData({
                          ...packageData,
                          endDate: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="difficulty">Difficulty Level</Label>
                    <Select
                      value={packageData.difficulty}
                      onValueChange={(value) =>
                        setPackageData({ ...packageData, difficulty: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select difficulty" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="easy">Easy</SelectItem>
                        <SelectItem value="moderate">Moderate</SelectItem>
                        <SelectItem value="challenging">Challenging</SelectItem>
                        <SelectItem value="extreme">Extreme</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={packageData.category}
                    onValueChange={(value) =>
                      setPackageData({ ...packageData, category: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="adventure">Adventure</SelectItem>
                      <SelectItem value="cultural">Cultural</SelectItem>
                      <SelectItem value="relaxation">Relaxation</SelectItem>
                      <SelectItem value="wildlife">Wildlife</SelectItem>
                      <SelectItem value="luxury">Luxury</SelectItem>
                      <SelectItem value="budget">Budget</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Itinerary */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Itinerary</CardTitle>
                    <CardDescription>
                      Plan the day-by-day activities
                    </CardDescription>
                  </div>
                  <Button onClick={addItineraryDay} size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Day
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {itinerary.map((day, dayIndex) => (
                  <div
                    key={dayIndex}
                    className="border rounded-lg p-4 space-y-4"
                  >
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-semibold">Day {day.day}</h3>
                      {itinerary.length > 1 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeItineraryDay(dayIndex)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>

                    {/* Day Images */}
                    <div className="space-y-3">
                      <Label>Day Images</Label>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {(day.images || []).map((image, imageIndex) => (
                          <div key={imageIndex} className="relative group">
                            <Image
                              src={image || '/placeholder.svg'}
                              alt={`Day ${day.day} image ${imageIndex + 1}`}
                              width={150}
                              height={100}
                              className="rounded-lg object-cover border"
                            />
                            <Button
                              variant="destructive"
                              size="sm"
                              className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() =>
                                removeDayImage(dayIndex, imageIndex)
                              }
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          </div>
                        ))}
                        <div className="border-2 border-dashed rounded-lg p-4 flex flex-col items-center justify-center min-h-[100px]">
                          <Upload className="w-6 h-6 text-muted-foreground mb-2" />
                          <Label
                            htmlFor={`day-${dayIndex}-image`}
                            className="cursor-pointer text-sm "
                          >
                            Add Image
                          </Label>
                          <Input
                            id={`day-${dayIndex}-image`}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleDayImageUpload(dayIndex, e)}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Day Title</Label>
                      <Input
                        placeholder="e.g., Arrival in Bali"
                        value={day.title}
                        onChange={(e) =>
                          updateItineraryDay(dayIndex, 'title', e.target.value)
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Description</Label>
                      <Textarea
                        placeholder="Describe the day's overview..."
                        value={day.description}
                        onChange={(e) =>
                          updateItineraryDay(
                            dayIndex,
                            'description',
                            e.target.value,
                          )
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <Label>Activities</Label>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => addActivity(dayIndex)}
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Add Activity
                        </Button>
                      </div>
                      {day.activities.map((activity, activityIndex) => (
                        <div key={activityIndex} className="flex gap-2">
                          <Input
                            placeholder="e.g., Visit Tanah Lot Temple"
                            value={activity}
                            onChange={(e) =>
                              updateActivity(
                                dayIndex,
                                activityIndex,
                                e.target.value,
                              )
                            }
                          />
                          {day.activities.length > 1 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                removeActivity(dayIndex, activityIndex)
                              }
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Meals Included</Label>
                        <div className="space-y-2">
                          {['Breakfast', 'Lunch', 'Dinner'].map((meal) => (
                            <div
                              key={meal}
                              className="flex items-center space-x-2"
                            >
                              <Checkbox
                                id={`${dayIndex}-${meal}`}
                                checked={day.meals.includes(meal)}
                                onCheckedChange={(checked) => {
                                  const newMeals = checked
                                    ? [...day.meals, meal]
                                    : day.meals.filter((m) => m !== meal);
                                  updateItineraryDay(
                                    dayIndex,
                                    'meals',
                                    newMeals,
                                  );
                                }}
                              />
                              <Label htmlFor={`${dayIndex}-${meal}`}>
                                {meal}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Accommodation</Label>
                        <Input
                          placeholder="e.g., Luxury Beach Resort"
                          value={day.accommodation}
                          onChange={(e) =>
                            updateItineraryDay(
                              dayIndex,
                              'accommodation',
                              e.target.value,
                            )
                          }
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Payment Structure */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Payment Structure</CardTitle>
                    <CardDescription>
                      Define payment milestones and percentages
                    </CardDescription>
                  </div>
                  <Button onClick={addPaymentMilestone} size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Milestone
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center p-3  rounded-lg">
                  <span className="font-medium">Total Payment Percentage:</span>
                  <Badge
                    variant={
                      getTotalPaymentPercentage() === 100
                        ? 'default'
                        : 'destructive'
                    }
                  >
                    {getTotalPaymentPercentage()}%
                  </Badge>
                </div>

                {paymentStructure.map((milestone) => (
                  <div
                    key={milestone.id}
                    className="border rounded-lg p-4 space-y-3"
                  >
                    <div className="flex justify-between items-center">
                      <h4 className="font-medium">Payment Milestone</h4>
                      {paymentStructure.length > 1 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removePaymentMilestone(milestone.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div className="space-y-2">
                        <Label>Milestone Name</Label>
                        <Input
                          placeholder="e.g., Booking Advance"
                          value={milestone.name}
                          onChange={(e) =>
                            updatePaymentMilestone(
                              milestone.id,
                              'name',
                              e.target.value,
                            )
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Percentage</Label>
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          placeholder="10"
                          value={milestone.percentage}
                          onChange={(e) =>
                            updatePaymentMilestone(
                              milestone.id,
                              'percentage',
                              Number.parseInt(e.target.value) || 0,
                            )
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Due Date</Label>
                        <Select
                          value={milestone.dueDate}
                          onValueChange={(value) =>
                            updatePaymentMilestone(
                              milestone.id,
                              'dueDate',
                              value,
                            )
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="booking">At Booking</SelectItem>
                            <SelectItem value="30_days_before">
                              30 Days Before
                            </SelectItem>
                            <SelectItem value="2_weeks_before">
                              2 Weeks Before
                            </SelectItem>
                            <SelectItem value="1_week_before">
                              1 Week Before
                            </SelectItem>
                            <SelectItem value="departure">
                              At Departure
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Description</Label>
                      <Input
                        placeholder="Description of this payment milestone"
                        value={milestone.description}
                        onChange={(e) =>
                          updatePaymentMilestone(
                            milestone.id,
                            'description',
                            e.target.value,
                          )
                        }
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Cancellation Structure */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Cancellation Structure</CardTitle>
                    <CardDescription>
                      Define cancellation fees based on timing
                    </CardDescription>
                  </div>
                  <Button onClick={addCancellationTier} size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Tier
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {cancellationStructure.map((tier) => (
                  <div
                    key={tier.id}
                    className="border rounded-lg p-4 space-y-3"
                  >
                    <div className="flex justify-between items-center">
                      <h4 className="font-medium">Cancellation Tier</h4>
                      {cancellationStructure.length > 1 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeCancellationTier(tier.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div className="space-y-2">
                        <Label>Timeframe</Label>
                        <Input
                          placeholder="e.g., 30+ days before"
                          value={tier.timeframe}
                          onChange={(e) =>
                            updateCancellationTier(
                              tier.id,
                              'timeframe',
                              e.target.value,
                            )
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Cancellation Fee (%)</Label>
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          placeholder="10"
                          value={tier.percentage}
                          onChange={(e) =>
                            updateCancellationTier(
                              tier.id,
                              'percentage',
                              Number.parseInt(e.target.value) || 0,
                            )
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Description</Label>
                        <Input
                          placeholder="Description of this tier"
                          value={tier.description}
                          onChange={(e) =>
                            updateCancellationTier(
                              tier.id,
                              'description',
                              e.target.value,
                            )
                          }
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Cancellation Policy */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Cancellation Policy</CardTitle>
                    <CardDescription>
                      Additional policy points and terms
                    </CardDescription>
                  </div>
                  <Button onClick={addCancellationPolicyPoint} size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Point
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {cancellationPolicy.map((point, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      placeholder="Enter policy point..."
                      value={point}
                      onChange={(e) =>
                        updateCancellationPolicyPoint(index, e.target.value)
                      }
                    />
                    {cancellationPolicy.length > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeCancellationPolicyPoint(index)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Meals Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>Meals Breakdown</CardTitle>
                <CardDescription>
                  Define what's included in each meal type
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {(['breakfast', 'lunch', 'dinner'] as const).map((mealType) => (
                  <div key={mealType} className="space-y-3">
                    <div className="flex justify-between items-center">
                      <Label className="text-base font-medium capitalize">
                        {mealType}
                      </Label>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => addMealItem(mealType)}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Item
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {mealsBreakdown[mealType].map((item, index) => (
                        <div key={index} className="flex gap-2">
                          <Input
                            placeholder={`Enter ${mealType} item...`}
                            value={item}
                            onChange={(e) =>
                              updateMealItem(mealType, index, e.target.value)
                            }
                          />
                          {mealsBreakdown[mealType].length > 1 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeMealItem(mealType, index)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Transportation */}
            <Card>
              <CardHeader>
                <CardTitle>Transportation</CardTitle>
                <CardDescription>
                  Define transportation arrangements
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* To Destination */}
                <div className="space-y-3">
                  <Label className="text-base font-medium">
                    To Destination
                  </Label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="space-y-2">
                      <Label>Mode of Transport</Label>
                      <Select
                        value={transportation.toDestination.mode}
                        onValueChange={(value) =>
                          setTransportation({
                            ...transportation,
                            toDestination: {
                              ...transportation.toDestination,
                              mode: value,
                            },
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="flight">Flight</SelectItem>
                          <SelectItem value="train">Train</SelectItem>
                          <SelectItem value="bus">Bus</SelectItem>
                          <SelectItem value="car">Car</SelectItem>
                          <SelectItem value="ship">Ship</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Details</Label>
                      <Input
                        placeholder="e.g., Economy class, Direct flight"
                        value={transportation.toDestination.details}
                        onChange={(e) =>
                          setTransportation({
                            ...transportation,
                            toDestination: {
                              ...transportation.toDestination,
                              details: e.target.value,
                            },
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Included in Package</Label>
                      <div className="flex items-center space-x-2 pt-2">
                        <Checkbox
                          checked={transportation.toDestination.included}
                          onCheckedChange={(checked) =>
                            setTransportation({
                              ...transportation,
                              toDestination: {
                                ...transportation.toDestination,
                                included: !!checked,
                              },
                            })
                          }
                        />
                        <span className="text-sm">Yes, included</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* From Destination */}
                <div className="space-y-3">
                  <Label className="text-base font-medium">
                    From Destination
                  </Label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="space-y-2">
                      <Label>Mode of Transport</Label>
                      <Select
                        value={transportation.fromDestination.mode}
                        onValueChange={(value) =>
                          setTransportation({
                            ...transportation,
                            fromDestination: {
                              ...transportation.fromDestination,
                              mode: value,
                            },
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="flight">Flight</SelectItem>
                          <SelectItem value="train">Train</SelectItem>
                          <SelectItem value="bus">Bus</SelectItem>
                          <SelectItem value="car">Car</SelectItem>
                          <SelectItem value="ship">Ship</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Details</Label>
                      <Input
                        placeholder="e.g., Economy class, Direct flight"
                        value={transportation.fromDestination.details}
                        onChange={(e) =>
                          setTransportation({
                            ...transportation,
                            fromDestination: {
                              ...transportation.fromDestination,
                              details: e.target.value,
                            },
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Included in Package</Label>
                      <div className="flex items-center space-x-2 pt-2">
                        <Checkbox
                          checked={transportation.fromDestination.included}
                          onCheckedChange={(checked) =>
                            setTransportation({
                              ...transportation,
                              fromDestination: {
                                ...transportation.fromDestination,
                                included: !!checked,
                              },
                            })
                          }
                        />
                        <span className="text-sm">Yes, included</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* During Trip */}
                <div className="space-y-3">
                  <Label className="text-base font-medium">During Trip</Label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="space-y-2">
                      <Label>Mode of Transport</Label>
                      <Select
                        value={transportation.duringTrip.mode}
                        onValueChange={(value) =>
                          setTransportation({
                            ...transportation,
                            duringTrip: {
                              ...transportation.duringTrip,
                              mode: value,
                            },
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="bus">Bus</SelectItem>
                          <SelectItem value="car">Car</SelectItem>
                          <SelectItem value="train">Train</SelectItem>
                          <SelectItem value="boat">Boat</SelectItem>
                          <SelectItem value="walking">Walking</SelectItem>
                          <SelectItem value="mixed">Mixed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Details</Label>
                      <Input
                        placeholder="e.g., Air-conditioned coach, Private transfers"
                        value={transportation.duringTrip.details}
                        onChange={(e) =>
                          setTransportation({
                            ...transportation,
                            duringTrip: {
                              ...transportation.duringTrip,
                              details: e.target.value,
                            },
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Included in Package</Label>
                      <div className="flex items-center space-x-2 pt-2">
                        <Checkbox
                          checked={transportation.duringTrip.included}
                          onCheckedChange={(checked) =>
                            setTransportation({
                              ...transportation,
                              duringTrip: {
                                ...transportation.duringTrip,
                                included: !!checked,
                              },
                            })
                          }
                        />
                        <span className="text-sm">Yes, included</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Package Location */}
            <Card>
              <CardHeader>
                <CardTitle>Package Location</CardTitle>
                <CardDescription>
                  Specify if this is an international or local package
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Package Type</Label>
                  <Select
                    value={packageLocation.type}
                    onValueChange={(value: 'international' | 'local') =>
                      setPackageLocation({
                        ...packageLocation,
                        type: value,
                        state:
                          value === 'international'
                            ? ''
                            : packageLocation.state,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="international">
                        International
                      </SelectItem>
                      <SelectItem value="local">Local/Domestic</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Country</Label>
                  <Input
                    placeholder="e.g., Indonesia, India, Thailand"
                    value={packageLocation.country}
                    onChange={(e) =>
                      setPackageLocation({
                        ...packageLocation,
                        country: e.target.value,
                      })
                    }
                  />
                </div>

                {packageLocation.type === 'local' && (
                  <div className="space-y-2">
                    <Label>State/Region</Label>
                    <Select
                      value={packageLocation.state || ''}
                      onValueChange={(value) =>
                        setPackageLocation({ ...packageLocation, state: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select state" />
                      </SelectTrigger>
                      <SelectContent>
                        {indianStates.map((state) => (
                          <SelectItem key={state} value={state}>
                            {state}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Document Requirements */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Document Requirements</CardTitle>
                    <CardDescription>
                      Specify documents required for travelers
                    </CardDescription>
                  </div>
                  <Button onClick={addDocumentRequirement} size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Document
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {documentRequirements.map((doc) => (
                  <div key={doc.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex justify-between items-center">
                      <h4 className="font-medium">Document Requirement</h4>
                      {documentRequirements.length > 1 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeDocumentRequirement(doc.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label>Document Name</Label>
                        <Input
                          placeholder="e.g., Valid Passport"
                          value={doc.name}
                          onChange={(e) =>
                            updateDocumentRequirement(
                              doc.id,
                              'name',
                              e.target.value,
                            )
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Applicable For</Label>
                        <Select
                          value={doc.applicableFor}
                          onValueChange={(value) => {
                            updateDocumentRequirement(
                              doc.id,
                              'applicableFor',
                              value,
                            );
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Travelers</SelectItem>
                            <SelectItem value="adults">Adults Only</SelectItem>
                            <SelectItem value="children">
                              Children Only
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Description</Label>
                      <Input
                        placeholder="e.g., Passport valid for at least 6 months from travel date"
                        value={doc.description}
                        onChange={(e) =>
                          updateDocumentRequirement(
                            doc.id,
                            'description',
                            e.target.value,
                          )
                        }
                      />
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        checked={doc.mandatory}
                        onCheckedChange={(checked) =>
                          updateDocumentRequirement(
                            doc.id,
                            'mandatory',
                            !!checked,
                          )
                        }
                      />
                      <Label>Mandatory Document</Label>
                    </div>
                  </div>
                ))}

                {/* Document Categories */}
                <div className="mt-6 p-4  rounded-lg">
                  <h4 className="font-medium mb-3">Document Categories</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <h5 className="font-medium text-primary mb-2">
                        Adults Documents
                      </h5>
                      <ul className="space-y-1 ">
                        {documentRequirements
                          .filter(
                            (doc) =>
                              doc.applicableFor === 'adults' ||
                              doc.applicableFor === 'all',
                          )
                          .map((doc) => (
                            <li key={doc.id}>• {doc.name}</li>
                          ))}
                      </ul>
                    </div>
                    <div>
                      <h5 className="font-medium text-primary mb-2">
                        Children Documents
                      </h5>
                      <ul className="space-y-1 ">
                        {documentRequirements
                          .filter(
                            (doc) =>
                              doc.applicableFor === 'children' ||
                              doc.applicableFor === 'all',
                          )
                          .map((doc) => (
                            <li key={doc.id}>• {doc.name}</li>
                          ))}
                      </ul>
                    </div>
                    <div>
                      <h5 className="font-medium text-primary mb-2">
                        Mandatory
                      </h5>
                      <ul className="space-y-1 ">
                        {documentRequirements
                          .filter((doc) => doc.mandatory)
                          .map((doc) => (
                            <li key={doc.id}>• {doc.name}</li>
                          ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Pre-Trip Checklist */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Pre-Trip Checklist</CardTitle>
                    <CardDescription>
                      Tasks for operators to complete before departure
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={addDocumentsToChecklist}
                      size="sm"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Documents
                    </Button>
                    <Button onClick={addChecklistItem} size="sm">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Task
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {preTripChecklist.map((item) => (
                  <div
                    key={item.id}
                    className="border rounded-lg p-4 space-y-3"
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Checkbox
                          checked={item.completed}
                          onCheckedChange={(checked) =>
                            updateChecklistItem(item.id, 'completed', !!checked)
                          }
                        />
                        <h4 className="font-medium">Checklist Item</h4>
                        <Badge
                          variant={
                            item.category === 'documents'
                              ? 'default'
                              : 'secondary'
                          }
                        >
                          {item.category}
                        </Badge>
                      </div>
                      {preTripChecklist.length > 1 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeChecklistItem(item.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label>Task</Label>
                        <Input
                          placeholder="e.g., Collect all documents"
                          value={item.task}
                          onChange={(e) =>
                            updateChecklistItem(item.id, 'task', e.target.value)
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Category</Label>
                        <Select
                          value={item.category}
                          onValueChange={(value) => {
                            updateChecklistItem(item.id, 'category', value);
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="documents">Documents</SelectItem>
                            <SelectItem value="booking">Booking</SelectItem>
                            <SelectItem value="preparation">
                              Preparation
                            </SelectItem>
                            <SelectItem value="communication">
                              Communication
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label>Description</Label>
                        <Input
                          placeholder="Detailed description of the task"
                          value={item.description}
                          onChange={(e) =>
                            updateChecklistItem(
                              item.id,
                              'description',
                              e.target.value,
                            )
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Due Date</Label>
                        <Select
                          value={item.dueDate}
                          onValueChange={(value) => {
                            updateChecklistItem(item.id, 'dueDate', value);
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="30_days_before">
                              30 Days Before
                            </SelectItem>
                            <SelectItem value="2_weeks_before">
                              2 Weeks Before
                            </SelectItem>
                            <SelectItem value="1_week_before">
                              1 Week Before
                            </SelectItem>
                            <SelectItem value="3_days_before">
                              3 Days Before
                            </SelectItem>
                            <SelectItem value="departure_day">
                              Departure Day
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Checklist Summary */}
                <div className="mt-6 p-4  rounded-lg">
                  <h4 className="font-medium mb-3">Checklist Summary</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">
                        {
                          preTripChecklist.filter(
                            (item) => item.category === 'documents',
                          ).length
                        }
                      </div>
                      <div className="">Documents</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">
                        {
                          preTripChecklist.filter(
                            (item) => item.category === 'booking',
                          ).length
                        }
                      </div>
                      <div className="">Bookings</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">
                        {
                          preTripChecklist.filter(
                            (item) => item.category === 'preparation',
                          ).length
                        }
                      </div>
                      <div className="">Preparation</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">
                        {
                          preTripChecklist.filter((item) => item.completed)
                            .length
                        }
                        /{preTripChecklist.length}
                      </div>
                      <div className="">Completed</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Inclusions */}
            <Card>
              <CardHeader>
                <CardTitle>Inclusions</CardTitle>
                <CardDescription>
                  What's included in the package
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Add inclusion..."
                    value={newInclusion}
                    onChange={(e) => setNewInclusion(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addInclusion()}
                  />
                  <Button onClick={addInclusion} size="sm">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="space-y-2">
                  {packageData.inclusions.map((inclusion, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between"
                    >
                      <Badge variant="secondary">{inclusion}</Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeInclusion(index)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Exclusions */}
            <Card>
              <CardHeader>
                <CardTitle>Exclusions</CardTitle>
                <CardDescription>What's not included</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Add exclusion..."
                    value={newExclusion}
                    onChange={(e) => setNewExclusion(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addExclusion()}
                  />
                  <Button onClick={addExclusion} size="sm">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="space-y-2">
                  {packageData.exclusions.map((exclusion, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between"
                    >
                      <Badge variant="outline">{exclusion}</Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeExclusion(index)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Package Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Package Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm ">Status:</span>
                  <Badge
                    variant={
                      packageData.status === 'published'
                        ? 'default'
                        : 'secondary'
                    }
                  >
                    {packageData.status}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm ">Duration:</span>
                  <span className="text-sm font-medium">
                    {packageData.duration || 'Not set'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm ">Price:</span>
                  <span className="text-sm font-medium">
                    {packageData.price ? `$${packageData.price}` : 'Not set'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm ">Max Guests:</span>
                  <span className="text-sm font-medium">
                    {packageData.maxGuests || 'Not set'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm ">Itinerary Days:</span>
                  <span className="text-sm font-medium">
                    {itinerary.length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm ">Payment Structure:</span>
                  <Badge
                    variant={
                      getTotalPaymentPercentage() === 100
                        ? 'default'
                        : 'destructive'
                    }
                  >
                    {getTotalPaymentPercentage()}%
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm ">Cancellation Tiers:</span>
                  <span className="text-sm font-medium">
                    {cancellationStructure.length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm ">Package Type:</span>
                  <Badge
                    variant={
                      packageLocation.type === 'international'
                        ? 'default'
                        : 'secondary'
                    }
                  >
                    {packageLocation.type}
                  </Badge>
                </div>
                {packageLocation.state && (
                  <div className="flex justify-between">
                    <span className="text-sm ">State:</span>
                    <span className="text-sm font-medium">
                      {packageLocation.state}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-sm ">Documents Required:</span>
                  <span className="text-sm font-medium">
                    {documentRequirements.length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm ">Checklist Items:</span>
                  <span className="text-sm font-medium">
                    {preTripChecklist.filter((item) => item.completed).length}/
                    {preTripChecklist.length}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
