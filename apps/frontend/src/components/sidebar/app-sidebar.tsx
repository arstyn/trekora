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
import { LogoIcon } from "@/components/logo";
import {
    Banknote,
    BarChart3,
    BookUser,
    CheckCircle2,
    FileChartColumnIncreasing,
    FileSpreadsheet,
    FolderIcon,
    HelpCircleIcon,
    LayoutDashboardIcon,
    ListIcon,
    SettingsIcon,
    Shield,
    ShieldCheck,
    Tickets,
    UsersIcon,
} from "lucide-react";
import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { NavDocuments } from "./nav-documents";
import { NavMain } from "./nav-main";
import { NavSecondary } from "./nav-secondary";
import { NavUser } from "./nav-user";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const [userData, setUserData] = useState<IEmployee>();
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

        getProfile();
    }, []);

    const data = {
        user: {
            name: userData?.name ?? "shadcn",
            email: userData?.email ?? "m@example.com",
            avatar: userData?.avatar ?? "/avatars/shadcn.jpg",
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
            // {
            // 	title: "Branches",
            // 	url: "/branches",
            // 	icon: Split,
            // },
            {
                title: "Employees",
                url: "/employees",
                icon: UsersIcon,
            },
            {
                title: "Packages",
                url: "/packages",
                icon: FolderIcon,
            },
            {
                title: "Batches",
                url: "/batches",
                icon: ListIcon,
            },
            {
                title: "Excel Import",
                url: "/import",
                icon: FileSpreadsheet,
            },
        ],
        documents: [
            {
                name: "Leads",
                url: "/leads",
                icon: FileChartColumnIncreasing,
            },
            {
                name: "Customers",
                url: "/customers",
                icon: BookUser,
            },
            {
                name: "Booking",
                url: "/bookings",
                icon: Tickets,
            },
            {
                name: "Payments",
                url: "/payments",
                icon: Banknote,
            },
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
                        <SidebarMenuButton
                            asChild
                            className="data-[slot=sidebar-menu-button]:!p-1.5"
                        >
                            <NavLink to="/dashboard">
                                <LogoIcon className="h-5 w-5" />
                                <span className="text-base font-semibold">
                                    Trekora
                                </span>
                            </NavLink>
                        </SidebarMenuButton>
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
