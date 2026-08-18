import React from "react";
import { mockFundraisers } from "@/lib/mock-data/fundraisers";

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
	const fundraiser = await getFundraiserById(fundraiserId);
	const activeTeams = await getActiveTeams();

	// const fundraiser = mockFundraisers.find(
	// 	(fundraiser) => fundraiser.id === fundraiserId,
	// );

	// if (!fundraiser) {
	// 	return <div>Fundraiser Not Found</div>;
	// }

	return (
		<div className="p-6">
			<FundraiserDetailLayout
				fundraiser={fundraiser}
				activeTeams={activeTeams}
			/>

			<p>{fundraiser.notes}</p>
			<p>{fundraiser.startDate.toLocaleDateString()}</p>
			<p>{fundraiser.status}</p>
			<p>{fundraiser.distributionMethod}</p>
			<p>{fundraiser.collectionType}</p>
			<p>{fundraiser.scope}</p>
		</div>
	);
}
