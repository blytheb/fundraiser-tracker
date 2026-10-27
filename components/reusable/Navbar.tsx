import {
	NavigationMenu,
	NavigationMenuList,
} from "@/components/ui/navigation-menu";
import LogoutButton from "@/components/auth/logout-button";
import ParentNavLinks from "@/components/reusable/ParentNavLinks";
import AdminNavLinks from "@/components/reusable/AdminNavLinks";

type NavbarProps = {
	role: string | null | undefined;
	name: string;
	email: string;
};

export default function Navbar({ role, name, email }: NavbarProps) {
	const displayName = name || "User";
	const isParent = role === "PARENT";
	const isAdmin = role === "ADMIN";
	return (
		<nav aria-label="Main navigation" className="mb-4 border-b">
			<NavigationMenu className="mx-auto min-h-14 w-full max-w-7xl px-4">
				<NavigationMenuList className="flex w-full justify-between">
					<div className="flex min-w-0 flex-wrap items-center gap-1">
						{isParent ? (
							<ParentNavLinks />
						) : (
							<AdminNavLinks isAdmin={isAdmin} />
						)}
					</div>

					<div className="flex shrink-0 justify-center items-center gap-4">
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
