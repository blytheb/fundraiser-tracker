"use client";

import {
	NavigationMenu,
	NavigationMenuList,
} from "@/components/ui/navigation-menu";
import LogoutButton from "@/components/auth/logout-button";
import ParentNavLinks from "@/components/reusable/ParentNavLinks";
import AdminNavLinks from "@/components/reusable/AdminNavLinks";
import { useState } from "react";
import { useRouter } from "next/navigation";

type NavbarProps = {
	role: string | null | undefined;
	name: string;
	email: string;
	hasParentAccess: boolean;
};

export default function Navbar({
	role,
	name,
	email,
	hasParentAccess,
}: NavbarProps) {
	const router = useRouter();
	const displayName = name || "User";
	const isParent = role === "PARENT";
	const isAdmin = role === "ADMIN";
	const [view, setView] = useState<"admin" | "parent">(
		isParent ? "parent" : "admin",
	);

	const showParentView =
		isParent || (isAdmin && hasParentAccess && view === "parent");

	return (
		<nav aria-label="Main navigation" className="mb-4 border-b">
			<NavigationMenu className="mx-auto min-h-14 w-full max-w-7xl px-4">
				<NavigationMenuList className="flex w-full justify-between">
					<div className="flex min-w-0 flex-wrap items-center gap-1">
						{showParentView ? (
							<ParentNavLinks />
						) : (
							<AdminNavLinks isAdmin={isAdmin} />
						)}

						{isAdmin && hasParentAccess && (
							<button
								type="button"
								className="rounded-md px-3 py-2 text-sm font-medium hover:bg-accent"
								onClick={() => {
									const nextView = view === "admin" ? "parent" : "admin";

									setView(nextView);
									router.push(nextView === "parent" ? "/my-players" : "/admin");
								}}>
								{view === "admin"
									? "Switch to Parent View"
									: "Switch to Admin View"}
							</button>
						)}
					</div>

					<div className="flex shrink-0 items-center justify-center gap-4">
						<div className="hidden text-right sm:block">
							<p className="text-sm font-medium">
								<span className="sr-only">Logged in as: </span>
								{displayName}
							</p>
							<p className="text-xs text-muted-foreground">{email}</p>
						</div>
						<LogoutButton />
					</div>
				</NavigationMenuList>
			</NavigationMenu>
		</nav>
	);
}
