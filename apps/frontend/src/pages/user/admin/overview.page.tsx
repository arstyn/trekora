import NAText from "@/components/na-text";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
    ChartContainer,
    ChartTooltip,
    type ChartConfig,
} from "@/components/ui/chart";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useHasPermission } from "@/hooks/use-permissions";
import axiosInstance from "@/lib/axios";
import { formatDate } from "@/lib/utils";
import { format } from "date-fns";
import {
    Calendar as CalendarIcon,
    DollarSign,
    FileText,
    Filter,
    Loader2,
    Search,
    TrendingDown,
    TrendingUp,
    Users,
    X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { DateRange } from "react-day-picker";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart as RechartsPieChart, XAxis, YAxis } from "recharts";

interface CreatedBy {
    id: string;
    name?: string;
    email?: string;
}

interface Lead {
    id: string;
    name: string;
    email?: string;
    phone?: string;
    status: string;
    createdAt: string;
    createdBy?: CreatedBy;
}

interface Customer {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    createdAt?: string;
    createdBy?: CreatedBy;
}

interface Booking {
    id: string;
    bookingNumber: string;
    customerName: string;
    packageName: string;
    totalAmount: number;
    status: string;
    createdAt: string;
    createdBy?: CreatedBy | null;
}

interface Payment {
    id: string;
    amount: number;
    paymentType: string;
    status: string;
    paymentDate: string;
    booking: {
        bookingNumber: string;
        customer: {
            name: string;
        };
    };
    recordedBy: {
        firstName: string;
        lastName: string;
        email: string;
    };
}

interface FilterState {
    dateRange: DateRange | undefined;
    search: string;
    status: string;
    creatorId: string;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

export default function AdminOverviewPage() {
    const { hasPermission: canView, loading: permissionLoading } = useHasPermission(
        "permission",
        "manage"
    );
    const [allData, setAllData] = useState<{
        leads: Lead[];
        customers: Customer[];
        bookings: Booking[];
        payments: Payment[];
    }>({ leads: [], customers: [], bookings: [], payments: [] });
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("overview");
    const [filters, setFilters] = useState<FilterState>({
        dateRange: undefined,
        search: "",
        status: "all",
        creatorId: "all",
    });

    const [creators, setCreators] = useState<CreatedBy[]>([]);

    useEffect(() => {
        if (!permissionLoading && canView) {
            fetchAllData();
        }
    }, [permissionLoading, canView]);

    const fetchAllData = async () => {
        try {
            setLoading(true);
            const [leadsRes, customersRes, bookingsRes, paymentsRes] = await Promise.all([
                axiosInstance.get<Lead[]>("/lead"),
                axiosInstance.get<{ customers: Customer[] }>("/customers?limit=1000&offset=0"),
                axiosInstance.get<Booking[]>("/bookings?limit=1000&offset=0"),
                axiosInstance.get<{ data: Payment[] }>("/payments?limit=1000&page=1"),
            ]);

            const leadsData = leadsRes.data;
            const customersData = customersRes.data.customers;
            const bookingsData = bookingsRes.data;
            const paymentsData = paymentsRes.data.data || [];

            setAllData({
                leads: leadsData,
                customers: customersData,
                bookings: bookingsData,
                payments: paymentsData,
            });

            // Extract unique creators
            const allCreators = new Map<string, CreatedBy>();
            [...leadsData, ...customersData, ...bookingsData].forEach((item) => {
                if (item.createdBy) {
                    allCreators.set(item.createdBy.id, item.createdBy);
                }
            });
            paymentsData.forEach((payment) => {
                if (payment.recordedBy) {
                    allCreators.set(payment.recordedBy.email, {
                        id: payment.recordedBy.email,
                        name: `${payment.recordedBy.firstName} ${payment.recordedBy.lastName}`,
                        email: payment.recordedBy.email,
                    });
                }
            });
            setCreators(Array.from(allCreators.values()));
        } catch (error) {
            console.error("Error fetching overview data:", error);
        } finally {
            setLoading(false);
        }
    };

    // Filter data based on filters
    const filteredData = useMemo(() => {
        let filtered = {
            leads: [...allData.leads],
            customers: [...allData.customers],
            bookings: [...allData.bookings],
            payments: [...allData.payments],
        };

        // Date range filter
        if (filters.dateRange?.from && filters.dateRange?.to) {
            const from = filters.dateRange.from;
            const to = filters.dateRange.to;
            to.setHours(23, 59, 59, 999);

            filtered.leads = filtered.leads.filter((lead) => {
                const date = new Date(lead.createdAt);
                return date >= from && date <= to;
            });
            filtered.customers = filtered.customers.filter((customer) => {
                if (!customer.createdAt) return false;
                const date = new Date(customer.createdAt);
                return date >= from && date <= to;
            });
            filtered.bookings = filtered.bookings.filter((booking) => {
                const date = new Date(booking.createdAt);
                return date >= from && date <= to;
            });
            filtered.payments = filtered.payments.filter((payment) => {
                const date = new Date(payment.paymentDate);
                return date >= from && date <= to;
            });
        }

        // Search filter
        if (filters.search) {
            const searchLower = filters.search.toLowerCase();
            filtered.leads = filtered.leads.filter(
                (lead) =>
                    lead.name.toLowerCase().includes(searchLower) ||
                    lead.email?.toLowerCase().includes(searchLower) ||
                    lead.phone?.toLowerCase().includes(searchLower)
            );
            filtered.customers = filtered.customers.filter(
                (customer) =>
                    customer.firstName.toLowerCase().includes(searchLower) ||
                    customer.lastName.toLowerCase().includes(searchLower) ||
                    customer.email.toLowerCase().includes(searchLower) ||
                    customer.phone.toLowerCase().includes(searchLower)
            );
            filtered.bookings = filtered.bookings.filter(
                (booking) =>
                    booking.bookingNumber.toLowerCase().includes(searchLower) ||
                    booking.customerName.toLowerCase().includes(searchLower) ||
                    booking.packageName.toLowerCase().includes(searchLower)
            );
            filtered.payments = filtered.payments.filter(
                (payment) =>
                    payment.booking.bookingNumber.toLowerCase().includes(searchLower) ||
                    payment.booking.customer.name.toLowerCase().includes(searchLower)
            );
        }

        // Status filter
        if (filters.status !== "all") {
            filtered.leads = filtered.leads.filter((lead) => lead.status === filters.status);
            filtered.bookings = filtered.bookings.filter((booking) => booking.status === filters.status);
            filtered.payments = filtered.payments.filter((payment) => payment.status === filters.status);
        }

        // Creator filter
        if (filters.creatorId !== "all") {
            filtered.leads = filtered.leads.filter((lead) => lead.createdBy?.id === filters.creatorId);
            filtered.customers = filtered.customers.filter((customer) => customer.createdBy?.id === filters.creatorId);
            filtered.bookings = filtered.bookings.filter((booking) => booking.createdBy?.id === filters.creatorId);
            filtered.payments = filtered.payments.filter((payment) => payment.recordedBy?.email === filters.creatorId);
        }

        return filtered;
    }, [allData, filters]);

    // Calculate stats
    const stats = useMemo(() => {
        const totalRevenue = filteredData.payments
            .filter((p) => p.status === "completed" || p.status === "confirmed")
            .reduce((sum, p) => sum + p.amount, 0);

        const previousPeriodRevenue = (() => {
            if (!filters.dateRange?.from) return 0;
            const periodDays = Math.ceil(
                (filters.dateRange.to?.getTime() || Date.now()) - filters.dateRange.from.getTime()
            ) / (1000 * 60 * 60 * 24);
            const previousFrom = new Date(filters.dateRange.from);
            previousFrom.setDate(previousFrom.getDate() - periodDays);
            const previousTo = new Date(filters.dateRange.from);

            return allData.payments
                .filter((p) => {
                    const date = new Date(p.paymentDate);
                    return date >= previousFrom && date < previousTo && (p.status === "completed" || p.status === "confirmed");
                })
                .reduce((sum, p) => sum + p.amount, 0);
        })();

        const revenueChange = previousPeriodRevenue > 0
            ? ((totalRevenue - previousPeriodRevenue) / previousPeriodRevenue) * 100
            : 0;

        return {
            totalLeads: filteredData.leads.length,
            totalCustomers: filteredData.customers.length,
            totalBookings: filteredData.bookings.length,
            totalPayments: filteredData.payments.length,
            totalRevenue,
            revenueChange,
        };
    }, [filteredData, filters.dateRange, allData.payments]);

    // Prepare chart data
    const chartData = useMemo(() => {
        const dataMap = new Map<string, { date: string; leads: number; customers: number; bookings: number; payments: number; revenue: number }>();

        [...filteredData.leads, ...filteredData.customers, ...filteredData.bookings].forEach((item) => {
            const createdAt = 'createdAt' in item ? item.createdAt : undefined;
            if (!createdAt) return;
            const date = new Date(createdAt).toISOString().split('T')[0];
            if (!dataMap.has(date)) {
                dataMap.set(date, { date, leads: 0, customers: 0, bookings: 0, payments: 0, revenue: 0 });
            }
            const entry = dataMap.get(date)!;
            if ('name' in item) entry.leads++;
            else if ('firstName' in item) entry.customers++;
            else if ('bookingNumber' in item) entry.bookings++;
        });

        filteredData.payments.forEach((payment) => {
            const date = new Date(payment.paymentDate).toISOString().split('T')[0];
            if (!dataMap.has(date)) {
                dataMap.set(date, { date, leads: 0, customers: 0, bookings: 0, payments: 0, revenue: 0 });
            }
            const entry = dataMap.get(date)!;
            entry.payments++;
            if (payment.status === "completed" || payment.status === "confirmed") {
                entry.revenue += payment.amount;
            }
        });

        return Array.from(dataMap.values())
            .sort((a, b) => a.date.localeCompare(b.date))
            .slice(-30); // Last 30 days
    }, [filteredData]);

    // Status distribution data
    const statusDistribution = useMemo(() => {
        const leadStatuses = new Map<string, number>();
        filteredData.leads.forEach((lead) => {
            leadStatuses.set(lead.status, (leadStatuses.get(lead.status) || 0) + 1);
        });

        const bookingStatuses = new Map<string, number>();
        filteredData.bookings.forEach((booking) => {
            bookingStatuses.set(booking.status, (bookingStatuses.get(booking.status) || 0) + 1);
        });

        return {
            leads: Array.from(leadStatuses.entries()).map(([name, value]) => ({ name, value })),
            bookings: Array.from(bookingStatuses.entries()).map(([name, value]) => ({ name, value })),
        };
    }, [filteredData]);

    // Creator performance data
    const creatorPerformance = useMemo(() => {
        const creatorMap = new Map<string, { name: string; leads: number; customers: number; bookings: number; revenue: number }>();

        filteredData.leads.forEach((lead) => {
            if (lead.createdBy) {
                const key = lead.createdBy.id;
                if (!creatorMap.has(key)) {
                    creatorMap.set(key, {
                        name: lead.createdBy.name || lead.createdBy.email || "Unknown",
                        leads: 0,
                        customers: 0,
                        bookings: 0,
                        revenue: 0,
                    });
                }
                creatorMap.get(key)!.leads++;
            }
        });

        filteredData.customers.forEach((customer) => {
            if (customer.createdBy) {
                const key = customer.createdBy.id;
                if (!creatorMap.has(key)) {
                    creatorMap.set(key, {
                        name: customer.createdBy.name || customer.createdBy.email || "Unknown",
                        leads: 0,
                        customers: 0,
                        bookings: 0,
                        revenue: 0,
                    });
                }
                creatorMap.get(key)!.customers++;
            }
        });

        filteredData.bookings.forEach((booking) => {
            if (booking.createdBy) {
                const key = booking.createdBy.id;
                if (!creatorMap.has(key)) {
                    creatorMap.set(key, {
                        name: booking.createdBy.name || booking.createdBy.email || "Unknown",
                        leads: 0,
                        customers: 0,
                        bookings: 0,
                        revenue: 0,
                    });
                }
                creatorMap.get(key)!.bookings++;
            }
        });

        filteredData.payments.forEach((payment) => {
            if (payment.recordedBy) {
                const key = payment.recordedBy.email;
                const name = `${payment.recordedBy.firstName} ${payment.recordedBy.lastName}`;
                if (!creatorMap.has(key)) {
                    creatorMap.set(key, {
                        name,
                        leads: 0,
                        customers: 0,
                        bookings: 0,
                        revenue: 0,
                    });
                }
                if (payment.status === "completed" || payment.status === "confirmed") {
                    creatorMap.get(key)!.revenue += payment.amount;
                }
            }
        });

        return Array.from(creatorMap.values())
            .sort((a, b) => b.revenue - a.revenue)
            .slice(0, 10);
    }, [filteredData]);

    const chartConfig: ChartConfig = {
        leads: { label: "Leads", color: "hsl(var(--chart-1))" },
        customers: { label: "Customers", color: "hsl(var(--chart-2))" },
        bookings: { label: "Bookings", color: "hsl(var(--chart-3))" },
        revenue: { label: "Revenue", color: "hsl(var(--chart-4))" },
    };

    const clearFilters = () => {
        setFilters({
            dateRange: undefined,
            search: "",
            status: "all",
            creatorId: "all",
        });
    };

    if (permissionLoading) {
        return (
            <div className="container mx-auto p-6">
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin" />
                </div>
            </div>
        );
    }

    if (!canView) {
        return (
            <div className="container mx-auto p-6">
                <div className="text-center py-12">
                    <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
                    <p className="text-muted-foreground">
                        You don't have permission to access this page.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Admin Overview</h1>
                    <p className="text-muted-foreground">
                        Comprehensive analytics and data management
                    </p>
                </div>
            </div>

            {/* Filters */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Filter className="h-4 w-4" />
                            <CardTitle>Filters</CardTitle>
                        </div>
                        <Button variant="ghost" size="sm" onClick={clearFilters}>
                            <X className="h-4 w-4 mr-2" />
                            Clear
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Date Range</label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className="w-full justify-start text-left font-normal"
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {filters.dateRange?.from ? (
                                            filters.dateRange.to ? (
                                                <>
                                                    {format(filters.dateRange.from, "LLL dd, y")} -{" "}
                                                    {format(filters.dateRange.to, "LLL dd, y")}
                                                </>
                                            ) : (
                                                format(filters.dateRange.from, "LLL dd, y")
                                            )
                                        ) : (
                                            <span>Pick a date range</span>
                                        )}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                        initialFocus
                                        mode="range"
                                        defaultMonth={filters.dateRange?.from}
                                        selected={filters.dateRange}
                                        onSelect={(range) =>
                                            setFilters((prev) => ({ ...prev, dateRange: range }))
                                        }
                                        numberOfMonths={2}
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Search</label>
                            <div className="relative">
                                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search..."
                                    value={filters.search}
                                    onChange={(e) =>
                                        setFilters((prev) => ({ ...prev, search: e.target.value }))
                                    }
                                    className="pl-8"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Status</label>
                            <Select
                                value={filters.status}
                                onValueChange={(value) =>
                                    setFilters((prev) => ({ ...prev, status: value }))
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="All Statuses" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Statuses</SelectItem>
                                    <SelectItem value="new">New</SelectItem>
                                    <SelectItem value="contacted">Contacted</SelectItem>
                                    <SelectItem value="qualified">Qualified</SelectItem>
                                    <SelectItem value="converted">Converted</SelectItem>
                                    <SelectItem value="lost">Lost</SelectItem>
                                    <SelectItem value="pending">Pending</SelectItem>
                                    <SelectItem value="confirmed">Confirmed</SelectItem>
                                    <SelectItem value="completed">Completed</SelectItem>
                                    <SelectItem value="cancelled">Cancelled</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Created By</label>
                            <Select
                                value={filters.creatorId}
                                onValueChange={(value) =>
                                    setFilters((prev) => ({ ...prev, creatorId: value }))
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="All Creators" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Creators</SelectItem>
                                    {creators.map((creator) => (
                                        <SelectItem key={creator.id} value={creator.id}>
                                            {creator.name || creator.email || "Unknown"}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalLeads}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalCustomers}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
                        <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalBookings}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Payments</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalPayments}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">${stats.totalRevenue.toLocaleString()}</div>
                        {stats.revenueChange !== 0 && (
                            <div className={`flex items-center text-xs mt-1 ${stats.revenueChange > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {stats.revenueChange > 0 ? (
                                    <TrendingUp className="h-3 w-3 mr-1" />
                                ) : (
                                    <TrendingDown className="h-3 w-3 mr-1" />
                                )}
                                {Math.abs(stats.revenueChange).toFixed(1)}%
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Analytics and Data Tables */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="leads">Leads</TabsTrigger>
                    <TabsTrigger value="customers">Customers</TabsTrigger>
                    <TabsTrigger value="bookings">Bookings</TabsTrigger>
                    <TabsTrigger value="payments">Payments</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                    {/* Time Series Chart */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Activity Trends</CardTitle>
                            <CardDescription>Daily activity over the last 30 days</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {chartData.length > 0 ? (
                                <ChartContainer config={chartConfig} className="h-[300px]">
                                    <AreaChart data={chartData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis
                                            dataKey="date"
                                            tickFormatter={(value) => format(new Date(value), "MMM dd")}
                                        />
                                        <YAxis />
                                        <ChartTooltip
                                            content={({ active, payload }) => {
                                                if (active && payload && payload.length) {
                                                    return (
                                                        <div className="rounded-lg border bg-background p-2 shadow-sm">
                                                            <div className="grid gap-2">
                                                                {payload.map((entry: any, index: number) => (
                                                                    <div key={index} className="flex items-center gap-2">
                                                                        <div
                                                                            className="h-2.5 w-2.5 rounded-full"
                                                                            style={{ backgroundColor: entry.color }}
                                                                        />
                                                                        <span className="text-sm font-medium">
                                                                            {entry.name}: {entry.value}
                                                                        </span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    );
                                                }
                                                return null;
                                            }}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="leads"
                                            stackId="1"
                                            stroke="hsl(var(--chart-1))"
                                            fill="hsl(var(--chart-1))"
                                            fillOpacity={0.6}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="customers"
                                            stackId="1"
                                            stroke="hsl(var(--chart-2))"
                                            fill="hsl(var(--chart-2))"
                                            fillOpacity={0.6}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="bookings"
                                            stackId="1"
                                            stroke="hsl(var(--chart-3))"
                                            fill="hsl(var(--chart-3))"
                                            fillOpacity={0.6}
                                        />
                                    </AreaChart>
                                </ChartContainer>
                            ) : (
                                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                                    <div className="text-center">
                                        <p className="text-sm">No activity data available</p>
                                        <p className="text-xs mt-1">Try adjusting your filters</p>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Revenue Chart */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Revenue Trend</CardTitle>
                            <CardDescription>Daily revenue over the last 30 days</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {chartData.length > 0 && chartData.some(d => d.revenue > 0) ? (
                                <ChartContainer config={chartConfig} className="h-[300px]">
                                    <LineChart data={chartData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis
                                            dataKey="date"
                                            tickFormatter={(value) => format(new Date(value), "MMM dd")}
                                        />
                                        <YAxis />
                                        <ChartTooltip
                                            content={({ active, payload }) => {
                                                if (active && payload && payload.length) {
                                                    return (
                                                        <div className="rounded-lg border bg-background p-2 shadow-sm">
                                                            <div className="grid gap-2">
                                                                {payload.map((entry: any, index: number) => (
                                                                    <div key={index} className="flex items-center gap-2">
                                                                        <div
                                                                            className="h-2.5 w-2.5 rounded-full"
                                                                            style={{ backgroundColor: entry.color }}
                                                                        />
                                                                        <span className="text-sm font-medium">
                                                                            Revenue: ${entry.value?.toLocaleString()}
                                                                        </span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    );
                                                }
                                                return null;
                                            }}
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey="revenue"
                                            stroke="hsl(var(--chart-4))"
                                            strokeWidth={2}
                                        />
                                    </LineChart>
                                </ChartContainer>
                            ) : (
                                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                                    <div className="text-center">
                                        <p className="text-sm">No revenue data available</p>
                                        <p className="text-xs mt-1">Try adjusting your filters</p>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Status Distribution - Leads */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Lead Status Distribution</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {statusDistribution.leads.length > 0 ? (
                                    <ChartContainer config={chartConfig} className="h-[250px]">
                                        <RechartsPieChart>
                                            <Pie
                                                data={statusDistribution.leads}
                                                cx="50%"
                                                cy="50%"
                                                labelLine={false}
                                                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                                outerRadius={80}
                                                fill="#8884d8"
                                                dataKey="value"
                                            >
                                                {statusDistribution.leads.map((_, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <ChartTooltip />
                                        </RechartsPieChart>
                                    </ChartContainer>
                                ) : (
                                    <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                                        <div className="text-center">
                                            <p className="text-sm">No lead data available</p>
                                            <p className="text-xs mt-1">Try adjusting your filters</p>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Status Distribution - Bookings */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Booking Status Distribution</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {statusDistribution.bookings.length > 0 ? (
                                    <ChartContainer config={chartConfig} className="h-[250px]">
                                        <RechartsPieChart>
                                            <Pie
                                                data={statusDistribution.bookings}
                                                cx="50%"
                                                cy="50%"
                                                labelLine={false}
                                                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                                outerRadius={80}
                                                fill="#8884d8"
                                                dataKey="value"
                                            >
                                                {statusDistribution.bookings.map((_, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <ChartTooltip />
                                        </RechartsPieChart>
                                    </ChartContainer>
                                ) : (
                                    <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                                        <div className="text-center">
                                            <p className="text-sm">No booking data available</p>
                                            <p className="text-xs mt-1">Try adjusting your filters</p>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Creator Performance */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Top Performers</CardTitle>
                            <CardDescription>Top 10 creators by revenue</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {creatorPerformance.length > 0 ? (
                                <ChartContainer config={chartConfig} className="h-[300px]">
                                    <BarChart data={creatorPerformance}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis
                                            dataKey="name"
                                            angle={-45}
                                            textAnchor="end"
                                            height={100}
                                        />
                                        <YAxis />
                                        <ChartTooltip />
                                        <Bar dataKey="revenue" fill="hsl(var(--chart-4))" />
                                    </BarChart>
                                </ChartContainer>
                            ) : (
                                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                                    <div className="text-center">
                                        <p className="text-sm">No performance data available</p>
                                        <p className="text-xs mt-1">Try adjusting your filters</p>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="leads" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Leads ({filteredData.leads.length})</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {loading ? (
                                <div className="flex items-center justify-center py-8">
                                    <Loader2 className="h-6 w-6 animate-spin" />
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Name</TableHead>
                                                <TableHead>Email</TableHead>
                                                <TableHead>Phone</TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead>Created By</TableHead>
                                                <TableHead>Created At</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {filteredData.leads.length > 0 ? (
                                                filteredData.leads.map((lead) => (
                                                    <TableRow key={lead.id}>
                                                        <TableCell className="font-medium">{lead.name}</TableCell>
                                                        <TableCell>{lead.email || <NAText />}</TableCell>
                                                        <TableCell>{lead.phone || <NAText />}</TableCell>
                                                        <TableCell>
                                                            <Badge variant="outline">{lead.status}</Badge>
                                                        </TableCell>
                                                        <TableCell>
                                                            {lead.createdBy ? (
                                                                <span className="text-sm">
                                                                    {lead.createdBy.name || lead.createdBy.email || "Unknown"}
                                                                </span>
                                                            ) : (
                                                                <NAText />
                                                            )}
                                                        </TableCell>
                                                        <TableCell>{formatDate(lead.createdAt)}</TableCell>
                                                    </TableRow>
                                                ))
                                            ) : (
                                                <TableRow>
                                                    <TableCell colSpan={6} className="text-center py-8">
                                                        No leads found
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="customers" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Customers ({filteredData.customers.length})</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {loading ? (
                                <div className="flex items-center justify-center py-8">
                                    <Loader2 className="h-6 w-6 animate-spin" />
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Name</TableHead>
                                                <TableHead>Email</TableHead>
                                                <TableHead>Phone</TableHead>
                                                <TableHead>Created By</TableHead>
                                                <TableHead>Created At</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {filteredData.customers.length > 0 ? (
                                                filteredData.customers.map((customer) => (
                                                    <TableRow key={customer.id}>
                                                        <TableCell className="font-medium">
                                                            {customer.firstName} {customer.lastName}
                                                        </TableCell>
                                                        <TableCell>{customer.email}</TableCell>
                                                        <TableCell>{customer.phone}</TableCell>
                                                        <TableCell>
                                                            {customer.createdBy ? (
                                                                <span className="text-sm">
                                                                    {customer.createdBy.name || customer.createdBy.email || "Unknown"}
                                                                </span>
                                                            ) : (
                                                                <NAText />
                                                            )}
                                                        </TableCell>
                                                        <TableCell>
                                                            {customer.createdAt ? formatDate(customer.createdAt) : <NAText />}
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            ) : (
                                                <TableRow>
                                                    <TableCell colSpan={5} className="text-center py-8">
                                                        No customers found
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="bookings" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Bookings ({filteredData.bookings.length})</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {loading ? (
                                <div className="flex items-center justify-center py-8">
                                    <Loader2 className="h-6 w-6 animate-spin" />
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Booking Number</TableHead>
                                                <TableHead>Customer</TableHead>
                                                <TableHead>Package</TableHead>
                                                <TableHead>Amount</TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead>Created By</TableHead>
                                                <TableHead>Created At</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {filteredData.bookings.length > 0 ? (
                                                filteredData.bookings.map((booking) => (
                                                    <TableRow key={booking.id}>
                                                        <TableCell className="font-medium">
                                                            {booking.bookingNumber}
                                                        </TableCell>
                                                        <TableCell>{booking.customerName}</TableCell>
                                                        <TableCell>{booking.packageName}</TableCell>
                                                        <TableCell>
                                                            ${booking.totalAmount.toLocaleString()}
                                                        </TableCell>
                                                        <TableCell>
                                                            <Badge variant="outline">{booking.status}</Badge>
                                                        </TableCell>
                                                        <TableCell>
                                                            {booking.createdBy ? (
                                                                <span className="text-sm">
                                                                    {booking.createdBy.name || booking.createdBy.email || "Unknown"}
                                                                </span>
                                                            ) : (
                                                                <NAText />
                                                            )}
                                                        </TableCell>
                                                        <TableCell>{formatDate(booking.createdAt)}</TableCell>
                                                    </TableRow>
                                                ))
                                            ) : (
                                                <TableRow>
                                                    <TableCell colSpan={7} className="text-center py-8">
                                                        No bookings found
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="payments" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Payments ({filteredData.payments.length})</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {loading ? (
                                <div className="flex items-center justify-center py-8">
                                    <Loader2 className="h-6 w-6 animate-spin" />
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Booking</TableHead>
                                                <TableHead>Customer</TableHead>
                                                <TableHead>Amount</TableHead>
                                                <TableHead>Type</TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead>Recorded By</TableHead>
                                                <TableHead>Date</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {filteredData.payments.length > 0 ? (
                                                filteredData.payments.map((payment) => (
                                                    <TableRow key={payment.id}>
                                                        <TableCell className="font-medium">
                                                            {payment.booking.bookingNumber}
                                                        </TableCell>
                                                        <TableCell>{payment.booking.customer.name}</TableCell>
                                                        <TableCell>${payment.amount.toLocaleString()}</TableCell>
                                                        <TableCell>
                                                            <Badge variant="outline">{payment.paymentType}</Badge>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Badge variant="outline">{payment.status}</Badge>
                                                        </TableCell>
                                                        <TableCell>
                                                            {payment.recordedBy ? (
                                                                <span className="text-sm">
                                                                    {payment.recordedBy.firstName} {payment.recordedBy.lastName}
                                                                </span>
                                                            ) : (
                                                                <NAText />
                                                            )}
                                                        </TableCell>
                                                        <TableCell>{formatDate(payment.paymentDate)}</TableCell>
                                                    </TableRow>
                                                ))
                                            ) : (
                                                <TableRow>
                                                    <TableCell colSpan={7} className="text-center py-8">
                                                        No payments found
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
