import {
	NavigationMenuItem,
	NavigationMenuLink,
} from "@/components/ui/navigation-menu";
import Link from "next/link";
import { House } from "lucide-react";
import { navLinkClassName } from "@/components/reusable/nav-link-styles";

type AdminNavLinksProps = {
	isAdmin: boolean;
};

export default function AdminNavLinks({ isAdmin }: AdminNavLinksProps) {
	return (
		<>
			{isAdmin && (
				<NavigationMenuItem>
					<NavigationMenuLink
						className={navLinkClassName}
						render={<Link href="/admin/dashboard" />}>
						<House />
					</NavigationMenuLink>
				</NavigationMenuItem>
			)}
			<NavigationMenuItem>
				<NavigationMenuLink
					className={navLinkClassName}
					render={<Link href="/admin/teams" />}>
					Teams
				</NavigationMenuLink>
			</NavigationMenuItem>

			<NavigationMenuItem>
				<NavigationMenuLink
					className={navLinkClassName}
					render={<Link href="/admin/players" />}>
					Players
				</NavigationMenuLink>
			</NavigationMenuItem>

			<NavigationMenuItem>
				<NavigationMenuLink
					className={navLinkClassName}
					render={<Link href="/admin/fundraisers" />}>
					Fundraisers
				</NavigationMenuLink>
			</NavigationMenuItem>
		</>
	);
}
