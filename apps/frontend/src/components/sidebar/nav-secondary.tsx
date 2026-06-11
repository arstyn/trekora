import {
	SidebarGroup,
	SidebarGroupContent,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "@/components/ui/sidebar";
import type { LucideIcon } from "lucide-react";
import * as React from "react";
import { NavLink, useLocation } from "react-router-dom";

export function NavSecondary({
	items,
	...props
}: {
	items: {
		title: string;
		url: string;
		icon: LucideIcon;
	}[];
} & React.ComponentPropsWithoutRef<typeof SidebarGroup>) {
	const location = useLocation();

	return (
		<SidebarGroup {...props}>
			<SidebarGroupContent>
				<SidebarMenu>
					{items.map((item) => {
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
