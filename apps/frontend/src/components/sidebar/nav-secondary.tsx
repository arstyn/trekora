import {
	SidebarGroup,
	SidebarGroupContent,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import type { LucideIcon } from "lucide-react";
import * as React from "react";
import { NavLink, useLocation } from "react-router-dom";

export function NavSecondary({
	items,
	loading,
	...props
}: {
	items: {
		title: string;
		url: string;
		icon: LucideIcon;
	}[];
	loading?: boolean;
} & React.ComponentPropsWithoutRef<typeof SidebarGroup>) {
	const location = useLocation();

	return (
		<SidebarGroup {...props}>
			<SidebarGroupContent>
			<SidebarMenu>
				{loading
					? Array.from({ length: 3 }).map((_, i) => (
							<SidebarMenuItem key={i}>
								<SidebarMenuButton asChild disabled>
									<div className="flex items-center gap-2">
										<Skeleton className="size-4 rounded" />
										<Skeleton className="h-4 w-20 rounded" />
									</div>
								</SidebarMenuButton>
							</SidebarMenuItem>
					  ))
					: items.map((item) => {
						const isActive = location.pathname === item.url || (item.url !== "/" && location.pathname.startsWith(item.url));
						return (
							<SidebarMenuItem key={item.title}>
								<SidebarMenuButton isActive={isActive} asChild>
									<NavLink to={item.url}>
										<item.icon />
										<span>{item.title}</span>
									</NavLink>
								</SidebarMenuButton>
							</SidebarMenuItem>
						);
					})}
			</SidebarMenu>
			</SidebarGroupContent>
		</SidebarGroup>
	);
}
