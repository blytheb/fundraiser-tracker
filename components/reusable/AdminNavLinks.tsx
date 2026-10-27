import {
	NavigationMenuItem,
	NavigationMenuLink,
} from "@/components/ui/navigation-menu";
import Link from "next/link";
import { navLinkClassName } from "@/components/reusable/nav-link-styles";

type AdminNavLinksProps = {
	isAdmin: boolean;
};

export default function AdminNavLinks({ isAdmin }: AdminNavLinksProps) {
	return (
		<>
			<NavigationMenuItem>
				<NavigationMenuLink
					className={navLinkClassName}
					render={<Link href="/teams" />}>
					Teams
				</NavigationMenuLink>
			</NavigationMenuItem>

			<NavigationMenuItem>
				<NavigationMenuLink
					className={navLinkClassName}
					render={<Link href="/players" />}>
					Players
				</NavigationMenuLink>
			</NavigationMenuItem>

			<NavigationMenuItem>
				<NavigationMenuLink
					className={navLinkClassName}
					render={<Link href="/fundraisers" />}>
					Fundraisers
				</NavigationMenuLink>
			</NavigationMenuItem>

			{isAdmin && (
				<NavigationMenuItem>
					<NavigationMenuLink
						className={navLinkClassName}
						render={<Link href="/admin" />}>
						Admin
					</NavigationMenuLink>
				</NavigationMenuItem>
			)}
		</>
	);
}
