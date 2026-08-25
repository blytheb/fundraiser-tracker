import React from "react";
import {
	NavigationMenu,
	NavigationMenuContent,
	NavigationMenuItem,
	NavigationMenuLink,
	NavigationMenuList,
	NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import Link from "next/link";

export default function Navbar() {
	return (
		<nav className="border-b mb-4">
			<NavigationMenu className="mx-auto h-14 max-w-7xl px-4">
				<NavigationMenuList className="flex justify-between">
					<div className="flex">
						<NavigationMenuItem>
							<NavigationMenuLink render={<Link href="/teams" />}>
								Teams
							</NavigationMenuLink>
						</NavigationMenuItem>
						<NavigationMenuItem>
							<NavigationMenuLink render={<Link href="/players" />}>
								Players
							</NavigationMenuLink>
						</NavigationMenuItem>
						<NavigationMenuItem>
							<NavigationMenuLink render={<Link href="/fundraisers" />}>
								Fundraisers
							</NavigationMenuLink>
						</NavigationMenuItem>
						<NavigationMenuItem>
							<NavigationMenuLink render={<Link href="/trips" />}>
								Trips
							</NavigationMenuLink>
						</NavigationMenuItem>
					</div>
					<div className="flex">
						<NavigationMenuItem>
							<NavigationMenuLink render={<Link href="/login" />}>
								Log In
							</NavigationMenuLink>
						</NavigationMenuItem>
					</div>
				</NavigationMenuList>
			</NavigationMenu>
		</nav>
	);
}
