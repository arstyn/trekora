import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	SidebarGroup,
	SidebarGroupLabel,
	SidebarMenu,
	SidebarMenuAction,
	SidebarMenuButton,
	SidebarMenuItem,
	useSidebar,
} from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { FolderIcon, MoreHorizontalIcon, ShareIcon, type LucideIcon } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";

export function NavDocuments({
	items,
	loading,
}: {
	items: {
		name: string;
		url: string;
		icon: LucideIcon;
	}[];
	loading?: boolean;
}) {
	const { isMobile } = useSidebar();
	const location = useLocation();

	return (
		<SidebarGroup className="group-data-[collapsible=icon]:hidden">
			<SidebarGroupLabel>Sales</SidebarGroupLabel>
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
							const isActive =
								location.pathname === item.url ||
								(item.url !== "/" && location.pathname.startsWith(item.url));
							return (
								<SidebarMenuItem key={item.name}>
									<SidebarMenuButton isActive={isActive} asChild>
										<NavLink to={item.url}>
											<item.icon />
											<span>{item.name}</span>
										</NavLink>
									</SidebarMenuButton>
									<DropdownMenu>
										<DropdownMenuTrigger asChild>
											<SidebarMenuAction
												showOnHover
												className="rounded-sm data-[state=open]:bg-accent"
											>
												<MoreHorizontalIcon />
												<span className="sr-only">More</span>
											</SidebarMenuAction>
										</DropdownMenuTrigger>
										<DropdownMenuContent
											className="w-24 rounded-lg"
											side={isMobile ? "bottom" : "right"}
											align={isMobile ? "end" : "start"}
										>
											<DropdownMenuItem>
												<FolderIcon />
												<span>Open</span>
											</DropdownMenuItem>
											<DropdownMenuItem>
												<ShareIcon />
												<span>Share</span>
											</DropdownMenuItem>
										</DropdownMenuContent>
									</DropdownMenu>
								</SidebarMenuItem>
							);
					  })}
				<SidebarMenuItem>
					<SidebarMenuButton className="text-sidebar-foreground/70">
						<MoreHorizontalIcon className="text-sidebar-foreground/70" />
						<span>More</span>
					</SidebarMenuButton>
				</SidebarMenuItem>
			</SidebarMenu>
		</SidebarGroup>
	);
}
