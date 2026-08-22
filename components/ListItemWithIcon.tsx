import React from "react";
import {
	Item,
	ItemActions,
	ItemContent,
	ItemDescription,
	ItemMedia,
	ItemTitle,
} from "@/components/ui/item";
import Link from "next/link";
import FundraiserActions from "@/components/fundraisers/FundraiserActions";

import type { LucideIcon } from "lucide-react";
import type { Fundraiser } from "@/types/fundraiser";

type ItemProps = {
	fundraiser: Fundraiser;
	activeIcon: LucideIcon;
	inactiveIcon: LucideIcon;
};

export default function ListItemWithIcon({
	fundraiser,
	activeIcon: ActiveIcon,
	inactiveIcon: InactiveIcon,
}: ItemProps) {
	return (
		<Item
			className="flex w-full items-center justify-center gap-6 py-2"
			variant="outline"
			size="sm">
			<ItemMedia>
				{fundraiser.status === "ACTIVE" ? (
					<ActiveIcon className="size-8" />
				) : (
					<InactiveIcon className="size-8" />
				)}
			</ItemMedia>
			<ItemContent>
				<Link href={`/fundraisers/${fundraiser.id}`}>
					<ItemTitle>{fundraiser.name}</ItemTitle>
					<ItemDescription> 8/19/2026 </ItemDescription>
				</Link>
			</ItemContent>
			<ItemActions>
				<FundraiserActions fundraiser={fundraiser} />
			</ItemActions>
		</Item>
	);
}
