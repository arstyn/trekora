"use client";

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
	let path = "";

	return (
		<Breadcrumb>
			<BreadcrumbList>
				{pathArray.map((name, index) => {
					path += "/" + name;

					if (index === pathArray.length - 1) {
						return (
							<BreadcrumbItem
								className="hidden md:block capitalize text-base font-medium"
								key={index}
							>
								<NavLink to={path}>{name}</NavLink>
							</BreadcrumbItem>
						);
					}

					return (
						<div key={index} className="flex items-center gap-3">
							<BreadcrumbItem className="hidden md:block capitalize text-base font-medium">
								<NavLink to={path}>{name}</NavLink>
							</BreadcrumbItem>
							<BreadcrumbSeparator className="hidden md:block" />
						</div>
					);
				})}
			</BreadcrumbList>
		</Breadcrumb>
	);
}
