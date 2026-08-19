import React from "react";
import {
	mockFundraisers,
	mockTestFundraiser,
	mockTestActiveTeams,
} from "@/lib/mock-data/fundraisers";

import FundraiserDetailLayout from "@/components/fundraisers/details/FundraiserDetailLayout";
import { getFundraiserById } from "@/lib/data/fundraisers";
import { getActiveTeams } from "@/lib/data/teams";

type TestPageProps = {
	params: Promise<{
		fundraiserId: string;
	}>;
};

export default async function FundraiserPage({ params }: TestPageProps) {
	const { fundraiserId } = await params;
	// const fundraiser = await getFundraiserById(fundraiserId);
	// const fundraiserTeams = getFundraiserTeams(fundraiserId)
	// const activeTeams = await getActiveTeams();

	const fundraiser = mockTestFundraiser;
	const fundraiserTeams = 
	const activeTeams = mockTestActiveTeams;

	return (
		<div className="p-6">
			<FundraiserDetailLayout
				fundraiser={fundraiser}
				activeTeams={activeTeams}
			/>

			<p>{fundraiser.startDate.toLocaleDateString()}</p>
			<p>{fundraiser.status}</p>
		</div>
	);
}
