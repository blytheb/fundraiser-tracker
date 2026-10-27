import {
	NavigationMenuItem,
	NavigationMenuLink,
} from "@/components/ui/navigation-menu";
import Link from "next/link";
import { navLinkClassName } from "@/components/reusable/nav-link-styles";

export default function ParentNavLinks() {
	return (
		<>
			<NavigationMenuItem>
				<NavigationMenuLink
					className={navLinkClassName}
					render={<Link href="/my-players" />}>
					My Players
				</NavigationMenuLink>
			</NavigationMenuItem>

			<NavigationMenuItem>
				<NavigationMenuLink
					className={navLinkClassName}
					render={<Link href="/my-access-requests" />}>
					My Access Requests
				</NavigationMenuLink>
			</NavigationMenuItem>

			<NavigationMenuItem>
				<NavigationMenuLink
					className={navLinkClassName}
					render={<Link href="/request-player-access" />}>
					Request Player Access
				</NavigationMenuLink>
			</NavigationMenuItem>
		</>
	);
}
