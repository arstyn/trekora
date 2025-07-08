'use client';

import { NavDocuments } from '@/components/nav-documents';
import { NavMain } from '@/components/nav-main';
import { NavSecondary } from '@/components/nav-secondary';
import { NavUser } from '@/components/nav-user';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import {
  ArrowUpCircleIcon,
  Banknote,
  BookUser,
  FileChartColumnIncreasing,
  FolderIcon,
  HelpCircleIcon,
  LayoutDashboardIcon,
  ListIcon,
  SettingsIcon,
  Split,
  Tickets,
  UsersIcon,
} from 'lucide-react';
import Link from 'next/link';

const data = {
  user: {
    name: 'shadcn',
    email: 'm@example.com',
    avatar: '/avatars/shadcn.jpg',
  },
  navMain: [
    {
      title: 'Dashboard',
      url: '/dashboard',
      icon: LayoutDashboardIcon,
    },
    {
      title: 'Branches',
      url: '/branches',
      icon: Split,
    },
    {
      title: 'Teams',
      url: '/teams',
      icon: UsersIcon,
    },
    {
      title: 'Packages',
      url: '/packages',
      icon: FolderIcon,
    },
    {
      title: 'Batches',
      url: '#',
      icon: ListIcon,
    },
  ],
  documents: [
    {
      name: 'Leads',
      url: '/leads',
      icon: FileChartColumnIncreasing,
    },
    {
      name: 'Customers',
      url: '/customers',
      icon: BookUser,
    },
    {
      name: 'Booking',
      url: '/booking',
      icon: Tickets,
    },
    {
      name: 'Payments',
      url: '/payments',
      icon: Banknote,
    },
  ],
  navSecondary: [
    {
      title: 'Settings',
      url: '/settings',
      icon: SettingsIcon,
    },
    {
      title: 'Get Help',
      url: '#',
      icon: HelpCircleIcon,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <Link href="/dashboard">
                <ArrowUpCircleIcon className="h-5 w-5" />
                <span className="text-base font-semibold">Trekora</span>
              </Link>
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
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <NavUser user={data.user} />
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
