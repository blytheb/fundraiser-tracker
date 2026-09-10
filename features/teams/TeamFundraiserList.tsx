import React from "react";
import { ItemGroup } from "@/components/ui/item";
import { BadgeCheckIcon, CalendarClock } from "lucide-react";
import ListItemWithIcon from "@/components/ui-reusable/ListItemWithIcon";
import TeamFundraiserActions from "@/features/teams/TeamFundraiserActions";
import type { Fundraiser } from "@prisma/client";

type ListProps = {
	teamId: string;
	fundraisers: Fundraiser[];
};
export default function TeamFundraiserList({ teamId, fundraisers }: ListProps) {
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
								action={
									<TeamFundraiserActions
										fundraiser={fundraiser}
										teamId={teamId}
									/>
								}
							/>
						))}
					</ItemGroup>
				</div>
			)}
		</div>
	);
}
