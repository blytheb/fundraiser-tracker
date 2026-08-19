import React from "react";

import PageHeader from "@/components/PageHeader";
import FundraiserDetail from "@/components/fundraisers/details/FundraiserDetail";
import FundraiserTeams from "@/components/fundraisers/details/FundraiserTeams";

import { getFundraiserById } from "@/lib/data/fundraisers";
import { getActiveTeams } from "@/lib/data/teams";
import { getFundraiserTeams } from "@/lib/data/fundraiserTeams";

type PageProps = {
	params: Promise<{
		fundraiserId: string;
	}>;
};

export default async function FundraiserPage({ params }: PageProps) {
	const { fundraiserId } = await params;
	const fundraiser = await getFundraiserById(fundraiserId);
	const fundraiserTeams = await getFundraiserTeams(fundraiserId);
	const activeTeams = await getActiveTeams();

	return (
		<div className="p-6">
			<PageHeader
				heading={fundraiser.name}
				subheading={fundraiser.description}
			/>
			<FundraiserDetail fundraiser={fundraiser} />
			<FundraiserTeams
				fundraiserId={fundraiserId}
				selectedTeams={fundraiserTeams}
				activeTeams={activeTeams}
			/>
		</div>
	);
}
