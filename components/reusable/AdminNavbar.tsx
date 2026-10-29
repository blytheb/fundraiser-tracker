"use client";

import {
	NavigationMenu,
	NavigationMenuList,
} from "@/components/ui/navigation-menu";
import LogoutButton from "@/components/auth/logout-button";
import AdminNavLinks from "@/components/reusable/AdminNavLinks";
import ViewSwitcher from "@/components/reusable/ViewSwitcher";

type NavbarProps = {
	role: string | null | undefined;
	name: string;
	email: string;
	hasParentAccess: boolean;
};

export default function AdminNavbar({
	role,
	name,
	email,
	hasParentAccess,
}: NavbarProps) {
	const displayName = name || "User";
	const canSwitchViews = role === "ADMIN" && hasParentAccess;

	return (
		<nav aria-label="Main navigation" className="mb-4 border-b">
			<NavigationMenu className="mx-auto min-h-14 w-full max-w-7xl px-4">
				<NavigationMenuList className="flex w-full justify-between">
					<div className="flex min-w-0 flex-wrap items-center gap-1">
						<AdminNavLinks isAdmin={role === "ADMIN"} />
						{canSwitchViews && <ViewSwitcher currentView="admin" />}
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
