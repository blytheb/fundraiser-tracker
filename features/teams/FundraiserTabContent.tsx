import AddFundraiserToTeamDialog from "@/components/forms/teams/AddFundraiserToTeamDialog";
import TeamFundraiserList from "@/features/teams/TeamFundraiserList";

import type { Fundraiser } from "@prisma/client";

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
		<section className="space-y-4">
			<div className="flex items-center justify-between gap-3">
				<div className="min-w-0">
					<h2 className="font-semibold">Fundraisers</h2>
					<p className="text-sm text-muted-foreground">
						{fundraisers.length}{" "}
						{fundraisers.length === 1 ? "fundraiser" : "fundraisers"}
					</p>
				</div>

				<AddFundraiserToTeamDialog
					teamId={teamId}
					availableFundraisers={availableFundraisers}
				/>
			</div>

			<TeamFundraiserList fundraisers={fundraisers} teamId={teamId} />
		</section>
	);
}
