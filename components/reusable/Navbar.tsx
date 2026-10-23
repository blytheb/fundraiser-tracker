import React from "react";
import {
	NavigationMenu,
	NavigationMenuItem,
	NavigationMenuLink,
	NavigationMenuList,
} from "@/components/ui/navigation-menu";
import LogoutButton from "@/components/auth/logout-button";

import Link from "next/link";

type NavbarProps = {
	role: string | null | undefined;
};

export default function Navbar({ role }: NavbarProps) {
	return (
		<nav className="border-b mb-4">
			<NavigationMenu className="mx-auto h-14 max-w-7xl px-4">
				<NavigationMenuList className="flex justify-between">
					<div className="flex">
						{role === "PARENT" ? (
							<>
								<NavigationMenuItem>
									<NavigationMenuLink render={<Link href="/my-players" />}>
										My Players
									</NavigationMenuLink>
								</NavigationMenuItem>
								<NavigationMenuItem>
									<NavigationMenuLink
										render={<Link href="/my-access-requests" />}>
										My Access Requests
									</NavigationMenuLink>
								</NavigationMenuItem>
								<NavigationMenuItem>
									<NavigationMenuLink
										render={<Link href="/request-player-access" />}>
										Request Player Access
									</NavigationMenuLink>
								</NavigationMenuItem>
							</>
						) : (
							<>
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
								{role === "ADMIN" && (
									<NavigationMenuItem>
										<NavigationMenuLink render={<Link href="/admin" />}>
											Admin
										</NavigationMenuLink>
									</NavigationMenuItem>
								)}
							</>
						)}
					</div>

					<div className="flex justify-center items-center gap-4">
						<h1>role: {role}</h1>
						<LogoutButton />
					</div>
				</NavigationMenuList>
			</NavigationMenu>
		</nav>
	);
}
