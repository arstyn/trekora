import { NavLink, useLocation } from "react-router-dom";
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbList,
	BreadcrumbSeparator,
} from "./ui/breadcrumb";

export default function NavbarBreadCrumbs() {
	const location = useLocation();
	const pathArray = location.pathname.split("/").filter((val) => val !== "");

	const isId = (str: string) => {
		const uuidPattern = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
		const mongoPattern = /^[0-9a-fA-F]{24}$/;
		const numericPattern = /^\d+$/;
		return uuidPattern.test(str) || mongoPattern.test(str) || (numericPattern.test(str) && str.length > 2);
	};

	let currentPath = "";
	const visibleItems = pathArray
		.map((name) => {
			currentPath += "/" + name;
			return {
				name,
				path: currentPath,
				isId: isId(name),
			};
		})
		.filter((item) => !item.isId);

	return (
		<Breadcrumb>
			<BreadcrumbList>
				{visibleItems.map((item, index) => {
					if (index === visibleItems.length - 1) {
						return (
							<BreadcrumbItem
								className="hidden md:block capitalize text-base font-medium"
								key={index}
							>
								<NavLink to={item.path}>{item.name}</NavLink>
							</BreadcrumbItem>
						);
					}

					return (
						<div key={index} className="flex items-center gap-3">
							<BreadcrumbItem className="hidden md:block capitalize text-base font-medium">
								<NavLink to={item.path}>{item.name}</NavLink>
							</BreadcrumbItem>
							<BreadcrumbSeparator className="hidden md:block" />
						</div>
					);
				})}
			</BreadcrumbList>
		</Breadcrumb>
	);
}
