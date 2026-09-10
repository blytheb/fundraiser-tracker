import React from "react";
import {
	Item,
	ItemContent,
	ItemDescription,
	ItemMedia,
	ItemTitle,
} from "@/components/ui/item";
import Link from "next/link";

import { BadgeCheckIcon, CalendarClock } from "lucide-react";
import { ChevronRight } from "lucide-react";

import type { Fundraiser } from "@prisma/client";

type ItemProps = {
	fundraiser: Fundraiser;
	action?: React.ReactNode;
};

export default function ListItemWithIcon({ fundraiser, action }: ItemProps) {
	const content = (
		<>
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
			{!action && <ChevronRight className="shrink-0" />}{" "}
		</>
	);

	// No action → entire card is clickable
	if (!action) {
		return (
			<Link href={`/fundraisers/${fundraiser.id}`}>
				<Item variant="outline" size="sm">
					{content}
				</Item>
			</Link>
		);
	}

	// Has action → only the content is clickable
	return (
		<Item variant="outline" size="sm">
			<Link
				href={`/fundraisers/${fundraiser.id}`}
				className="flex min-w-0 flex-1 items-center gap-4">
				{content}
			</Link>

			<div className="shrink-0">{action}</div>
		</Item>
	);
}
