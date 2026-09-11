import React from "react";
import {
	NavigationMenu,
	NavigationMenuItem,
	NavigationMenuLink,
	NavigationMenuList,
} from "@/components/ui/navigation-menu";
import Link from "next/link";

export default function PublicNavbar() {
	return (
		<nav className="border-b mb-4">
			<NavigationMenu className="mx-auto h-14 max-w-7xl px-4">
				<NavigationMenuList className="flex justify-between">
					<div className="flex">Fundraiser Tracker</div>
					<div className="flex">
						<NavigationMenuItem>
							<NavigationMenuLink render={<Link href="/" />}>
								Log In
							</NavigationMenuLink>
						</NavigationMenuItem>
					</div>
				</NavigationMenuList>
			</NavigationMenu>
		</nav>
	);
}
