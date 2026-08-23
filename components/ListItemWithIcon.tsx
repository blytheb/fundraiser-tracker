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
		<Item variant="outline" size="sm">
			<Link href={`/fundraisers/${fundraiser.id}`}>
				<div className="flex w-full items-center justify-center gap-6 py-2">
					<ItemMedia>
						{fundraiser.status === "ACTIVE" ? (
							<ActiveIcon className="size-8" />
						) : (
							<InactiveIcon className="size-8" />
						)}
					</ItemMedia>
					<ItemContent>
						<ItemTitle>{fundraiser.name}</ItemTitle>
						<ItemDescription> 8/19/2026 </ItemDescription>
					</ItemContent>
					{/* <ItemActions>
					<FundraiserActions fundraiser={fundraiser} />
				</ItemActions> */}
				</div>
			</Link>
		</Item>
	);
}
