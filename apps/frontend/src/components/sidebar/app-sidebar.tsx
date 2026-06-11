import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useHasPermission } from "@/hooks/use-permissions";
import axiosInstance from "@/lib/axios";
import type { IEmployee } from "@/types/employee.types";
import {
    Banknote,
    BarChart3,
    BookUser,
    Building,
    CheckCircle2,
    ChevronsUpDown,
    FileChartColumnIncreasing,
    FileSpreadsheet,
    FolderIcon,
    HelpCircleIcon,
    History,
    LayoutDashboardIcon,
    ListIcon,
    SettingsIcon,
    Shield,
    ShieldCheck,
    Tickets,
    UsersIcon,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { NavDocuments } from "./nav-documents";
import { NavMain } from "./nav-main";
import { NavSecondary } from "./nav-secondary";
import { NavUser } from "./nav-user";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const [userData, setUserData] = useState<IEmployee>();
    const [organizations, setOrganizations] = useState<any[]>([]);
    const { hasPermission: canManagePermissions } = useHasPermission(
        "permission",
        "manage",
    );
    const { hasPermission: canManagePermissionSets } = useHasPermission(
        "permission-set",
        "manage",
    );
    const { hasPermission: canReadEmployees } = useHasPermission(
        "employee",
        "read",
    );
    const { hasPermission: canReadPackages } = useHasPermission(
        "package",
        "read",
    );
    const { hasPermission: canReadBatches } = useHasPermission(
        "batch",
        "read",
    );
    const { hasPermission: canReadLeads } = useHasPermission(
        "lead",
        "read",
    );
    const { hasPermission: canReadCustomers } = useHasPermission(
        "customer",
        "read",
    );
    const { hasPermission: canReadBookings } = useHasPermission(
        "booking",
        "read",
    );
    const { hasPermission: canReadPayments } = useHasPermission(
        "payment",
        "read",
    );

    useEffect(() => {
        const getProfile = async () => {
            try {
                const res =
                    await axiosInstance.get<IEmployee>(`/employee/profile`);
                if (res) {
                    setUserData(res.data);
                }
            } catch (error) {
                console.error("Error fetching user profile:", error);
            }
        };

        const getOrganizations = async () => {
            try {
                const res = await axiosInstance.get<any[]>("/auth/user-organizations");
                if (res) {
                    setOrganizations(res.data);
                }
            } catch (error) {
                console.error("Error fetching user organizations:", error);
            }
        };

        getProfile();
        getOrganizations();
    }, []);

    const handleSwitch = async (organizationId: string) => {
        try {
            const res = await axiosInstance.post<{
                accessToken: string;
                refreshToken: string;
            }>("/auth/switch-organization", { organizationId });
            localStorage.setItem("accessToken", res.data.accessToken);
            localStorage.setItem("refreshToken", res.data.refreshToken);
            toast.success("Switched organization successfully");
            window.location.href = "/dashboard";
        } catch (error) {
            console.error("Failed to switch organization:", error);
            toast.error("Failed to switch organization");
        }
    };

    const data = {
        user: {
            name: userData?.name ?? "shadcn",
            email: userData?.email ?? "m@example.com",
            avatar: userData?.profilePhoto ?? "/avatars/shadcn.jpg",
        },
        navMain: [
            {
                title: "Dashboard",
                url: "/",
                icon: LayoutDashboardIcon,
            },
            {
                title: "Todos",
                url: "/todos",
                icon: CheckCircle2,
            },
            ...(canReadEmployees
                ? [
                    {
                        title: "Employees",
                        url: "/employees",
                        icon: UsersIcon,
                    },
                ]
                : []),
            ...(canReadPackages
                ? [
                    {
                        title: "Packages",
                        url: "/packages",
                        icon: FolderIcon,
                    },
                ]
                : []),
            ...(canReadBatches
                ? [
                    {
                        title: "Batches",
                        url: "/batches",
                        icon: ListIcon,
                    },
                ]
                : []),
            ...(canReadEmployees || canReadLeads || canReadCustomers
                ? [
                    {
                        title: "Excel Import",
                        url: "/import",
                        icon: FileSpreadsheet,
                    },
                ]
                : []),
        ],
        documents: [
            ...(canReadLeads
                ? [
                    {
                        name: "Leads",
                        url: "/leads",
                        icon: FileChartColumnIncreasing,
                    },
                ]
                : []),
            ...(canReadCustomers
                ? [
                    {
                        name: "Customers",
                        url: "/customers",
                        icon: BookUser,
                    },
                ]
                : []),
            ...(canReadBookings
                ? [
                    {
                        name: "Booking",
                        url: "/bookings",
                        icon: Tickets,
                    },
                ]
                : []),
            ...(canReadPayments
                ? [
                    {
                        name: "Payments",
                        url: "/payments",
                        icon: Banknote,
                    },
                ]
                : []),
        ],
        navSecondary: [
            ...(canManagePermissions
                ? [
                    {
                        title: "Admin Overview",
                        url: "/admin/overview",
                        icon: ShieldCheck,
                    },
                    {
                        title: "Permissions",
                        url: "/permissions",
                        icon: ShieldCheck,
                    },
                    {
                        title: "Activity Logs",
                        url: "/admin/logs",
                        icon: History,
                    },
                ]
                : []),
            ...(canReadEmployees && !canManagePermissions
                ? [
                    {
                        title: "Team Overview",
                        url: "/manager/overview",
                        icon: BarChart3,
                    },
                ]
                : []),
            ...(canManagePermissionSets
                ? [
                    {
                        title: "Permission Sets",
                        url: "/permission-sets",
                        icon: Shield,
                    },
                ]
                : []),
            {
                title: "Settings",
                url: "/settings",
                icon: SettingsIcon,
            },
            {
                title: "Get Help",
                url: "#",
                icon: HelpCircleIcon,
            },
        ],
    };

    return (
        <Sidebar collapsible="offcanvas" {...props}>
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <SidebarMenuButton
                                    size="lg"
                                    className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground cursor-pointer"
                                >
                                    <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                                        <Building className="size-4" />
                                    </div>
                                    <div className="grid flex-1 text-left text-sm leading-tight">
                                        <span className="truncate font-semibold">
                                            {userData?.organization?.name ?? "Trekora"}
                                        </span>
                                        <span className="truncate text-xs text-muted-foreground">
                                            Switch Organization
                                        </span>
                                    </div>
                                    <ChevronsUpDown className="ml-auto size-4 text-muted-foreground" />
                                </SidebarMenuButton>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                                align="start"
                                side="bottom"
                                sideOffset={4}
                            >
                                <DropdownMenuLabel className="text-xs text-muted-foreground">
                                    Organizations
                                </DropdownMenuLabel>
                                {organizations.map((orgEmp) => (
                                    <DropdownMenuItem
                                        key={orgEmp.organization.id}
                                        onClick={() => handleSwitch(orgEmp.organization.id)}
                                        className="gap-2 p-2 cursor-pointer"
                                    >
                                        <div className="flex size-6 items-center justify-center rounded-sm border bg-background">
                                            <Building className="size-3 shrink-0" />
                                        </div>
                                        <div className="flex-1 text-sm">
                                            {orgEmp.organization.name}
                                        </div>
                                        {orgEmp.organization.id === userData?.organization?.id && (
                                            <span className="ml-auto text-xs text-green-600 font-semibold">✓</span>
                                        )}
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
                <NavMain items={data.navMain} />
                <NavDocuments items={data.documents} />
                <NavSecondary items={data.navSecondary} className="mt-auto" />
            </SidebarContent>
            <SidebarFooter>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <NavUser user={data.user} />
                </div>
            </SidebarFooter>
        </Sidebar>
    );
}
