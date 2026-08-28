import React from "react";
import Link from "next/link";

import AddFundraiserToTeamDialog from "@/components/forms/teams/AddFundraiserToTeamDialog";
import ListItemWithIcon from "@/components/ui-reusable/ListItemWithIcon";
import TeamFundraiserActions from "@/features/teams/TeamFundraiserActions";

import type { Fundraiser } from "@/types/fundraiser";

type TabProps = {
	teamId: string;
	fundraisers: Fundraiser[];
	availableFundraisers: Fundraiser[];
};

export default function FundraiserTabContent({
	teamId,
	fundraisers,
	availableFundraisers,
}: TabProps) {
	return (
		<>
			<div className="mb-3 flex items-center justify-between">
				<div>
					<h2 className="font-semibold">Fundraisers</h2>

					<p className="text-sm text-muted-foreground">
						{fundraisers.length} fundraisers
					</p>
				</div>

				<AddFundraiserToTeamDialog
					teamId={teamId}
					availableFundraisers={availableFundraisers}
				/>
			</div>

			<div className="space-y-3">
				{fundraisers.map((fundraiser) => (
					<ListItemWithIcon
						key={fundraiser.id}
						fundraiser={fundraiser}
						actions={
							<TeamFundraiserActions fundraiser={fundraiser} teamId={teamId} />
						}
					/>
				))}
			</div>
		</>
	);
}
