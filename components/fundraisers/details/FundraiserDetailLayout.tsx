"use client";

import PageHeader from "@/components/PageHeader";
import FundraiserTeamsCard from "@/components/fundraisers/details/FundraiserTeamsCard";

import type { Fundraiser } from "@/types/fundraisers";
import type { Team } from "@/types/teams";

type LayoutProps = {
	fundraiser: Fundraiser;
	activeTeams: Team[];
};

export default function FundraiserDetailLayout({
	fundraiser,
	activeTeams,
}: LayoutProps) {
	return (
		<div className="p-6">
			<PageHeader
				heading={fundraiser.name}
				subheading={fundraiser.description}
			/>
			<FundraiserTeamsCard fundraiser={fundraiser} activeTeams={activeTeams} />
		</div>
	);
}
