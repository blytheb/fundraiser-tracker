import { getFundraiserById } from "@/features/fundraisers/data/fundraisers";
import { getFundraiserTeams } from "@/features/fundraisers/data/fundraiserTeams";
import { getFundraiserContributions } from "@/features/fundraisers/data/fundraiserContributions";
import { getFundraiserParticipants } from "@/features/fundraisers/data/fundraiserParticipants";
import {
	getFundraiserFinancialSummary,
	getActiveFundraiserAllocations,
} from "@/features/fundraisers/actions/fundraiserAllocation";
import {
	getActiveTeamsWithPlayers,
	getActiveTeams,
} from "@/features/teams/data/teams";

import FundraiserWorkspace from "@/features/fundraisers/FundraiserWorkspace";

type PageProps = {
	params: Promise<{
		fundraiserId: string;
	}>;
};
export default async function FundraiserPage({ params }: PageProps) {
	const { fundraiserId } = await params;

	const [
		fundraiser,
		teams,
		participants,
		contributions,
		financialSummary,
		activeAllocations,
		activeTeams,
		activeTeamsWithPlayers,
	] = await Promise.all([
		getFundraiserById(fundraiserId), //fundraiser info
		getFundraiserTeams(fundraiserId), //teams associated with fundraiser
		getFundraiserParticipants(fundraiserId), //participants associated with fundraiser
		getFundraiserContributions(fundraiserId), //contributions associated with fundraiser
		getFundraiserFinancialSummary(fundraiserId),
		getActiveFundraiserAllocations(fundraiserId), //active allocations for the fundraiser
		getActiveTeams(),
		getActiveTeamsWithPlayers(), //all active teams with players in the system
	]);

	if (!fundraiser) {
		return <div> Fundraiser Not Found </div>;
	}

	return (
		<FundraiserWorkspace
			fundraiser={fundraiser}
			teams={teams}
			participants={participants}
			contributions={contributions}
			financialSummary={financialSummary}
			activeAllocations={activeAllocations}
			activeTeams={activeTeams}
			activeTeamsWithPlayers={activeTeamsWithPlayers}
		/>
	);
}
