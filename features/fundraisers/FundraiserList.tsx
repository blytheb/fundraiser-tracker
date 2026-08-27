import React from "react";
import { ItemGroup } from "@/components/ui/item";
import { BadgeCheckIcon, CalendarClock } from "lucide-react";
import ListItemWithIcon from "@/components/ListItemWithIcon";

import type { Fundraiser } from "@/prisma/client";

type ListProps = {
	fundraisers: Fundraiser[];
};
export default function FundraiserList({ fundraisers }: ListProps) {
	return (
		<div className="space-y-2">
			{fundraisers.length === 0 ? (
				<div className="flex flex-col w-full items-center gap-3 rounded-lg border p-3">
					No Fundraisers Found
				</div>
			) : (
				<div className="space-y-4">
					<ItemGroup>
						{fundraisers.map((fundraiser) => (
							<ListItemWithIcon
								key={fundraiser.id}
								fundraiser={fundraiser}
								activeIcon={CalendarClock}
								inactiveIcon={BadgeCheckIcon}
							/>
						))}
					</ItemGroup>
				</div>
			)}
		</div>
	);
}
