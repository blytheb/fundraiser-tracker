import Link from "next/link";
import {
	BadgeCheck,
	CalendarClock,
	FileEdit,
	ChevronRight,
} from "lucide-react";
import {
	Item,
	ItemContent,
	ItemDescription,
	ItemMedia,
	ItemTitle,
} from "@/components/ui/item";
import type { Fundraiser } from "@prisma/client";

type FundraiserListItemProps = {
	fundraiser: Fundraiser;
};

export default function FundraiserListItem({
	fundraiser,
}: FundraiserListItemProps) {
	const status = fundraiser.isCompleted
		? "Completed"
		: fundraiser.isPublished
			? "Published"
			: "Draft";

	const StatusIcon = fundraiser.isCompleted
		? BadgeCheck
		: fundraiser.isPublished
			? CalendarClock
			: FileEdit;

	return (
		<Item variant="outline" size="sm">
			<Link
				href={`/fundraisers/${fundraiser.id}`}
				className="flex min-w-0 flex-1 items-center gap-3">
				<ItemMedia>
					<StatusIcon className="size-5 text-muted-foreground" />
				</ItemMedia>

				<ItemContent>
					<ItemTitle>{fundraiser.name}</ItemTitle>
					<ItemDescription>{status}</ItemDescription>
				</ItemContent>

				<ChevronRight className="size-4 shrink-0 text-muted-foreground" />
			</Link>
		</Item>
	);
}
