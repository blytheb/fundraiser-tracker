import React from "react";

import PageHeader from "@/components/PageHeader";
import FundraiserDetail from "@/components/fundraisers/details/FundraiserDetail";
import FundraiserTeams from "@/components/fundraisers/details/FundraiserTeams";
import FundraiserParticipants from "@/components/fundraisers/details/FundraiserParticipants";

import { getFundraiserById } from "@/lib/data/fundraisers";
import { getActiveTeams } from "@/lib/data/teams";
import { getFundraiserTeams } from "@/lib/data/fundraiserTeams";
import {
	getEligibleFundraiserPlayers,
	getFundraiserParticipants,
} from "@/lib/data/fundraiserParticipants";
import DistributeFundsDialog from "@/components/fundraisers/forms/DistributeFundsDialog";
type PageProps = {
	params: Promise<{
		fundraiserId: string;
	}>;
};

export default async function FundraiserPage({ params }: PageProps) {
	const { fundraiserId } = await params;

	const [
		fundraiser,
		fundraiserTeams,
		activeTeams,
		fundraiserParticipants,
		eligiblePlayers,
	] = await Promise.all([
		getFundraiserById(fundraiserId),
		getFundraiserTeams(fundraiserId),
		getActiveTeams(),
		getFundraiserParticipants(fundraiserId),
		getEligibleFundraiserPlayers(fundraiserId),
	]);

	return (
		<div className="space-y-6 p-6">
			<PageHeader
				heading={fundraiser.name}
				subheading={fundraiser.description}
			/>
			<DistributeFundsDialog
				fundraiserId={fundraiser.id}
				totalAmount={Number(fundraiser.totalAmount)}
				participants={fundraiserParticipants}
			/>
			<FundraiserDetail fundraiser={fundraiser} />

			<div className="grid gap-6 lg:grid-cols-2">
				<FundraiserTeams
					fundraiserId={fundraiserId}
					selectedTeams={fundraiserTeams}
					activeTeams={activeTeams}
				/>

				<FundraiserParticipants
					fundraiserId={fundraiserId}
					selectedPlayers={fundraiserParticipants}
					eligiblePlayers={eligiblePlayers}
				/>
			</div>
		</div>
	);
}
