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

import type { LucideIcon } from "lucide-react";
import { BadgeCheckIcon, CalendarClock } from "lucide-react";

import type { Fundraiser } from "@/types/fundraiser";

type ItemProps = {
	fundraiser: Fundraiser;
	activeIcon: LucideIcon;
	inactiveIcon: LucideIcon;
	actions?: React.ReactNode;
};

export default function ListItemWithIcon({ fundraiser, actions }: ItemProps) {
	return (
		<Item variant="outline" size="sm">
			<div className="flex w-full items-center justify-center gap-6 py-2">
				<ItemMedia>
					{fundraiser.status === "ACTIVE" ? (
						<CalendarClock className="size-8" />
					) : (
						<BadgeCheckIcon className="size-8" />
					)}
				</ItemMedia>
				<ItemContent>
					<ItemTitle>{fundraiser.name}</ItemTitle>
					<ItemDescription> 8/19/2026 </ItemDescription>
				</ItemContent>
				{actions && <ItemActions>{actions}</ItemActions>}
			</div>
		</Item>
	);
}
