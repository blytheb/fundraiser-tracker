import { getFundraiserById } from "@/features/fundraisers/data/fundraisers";
import { getFundraiserTeams } from "@/features/fundraisers/data/fundraiserTeams";
import { getFundraiserContributions } from "@/features/fundraisers/data/fundraiserContributions";
import { getFundraiserParticipants } from "@/features/fundraisers/data/fundraiserParticipants";
import { getFundraiserFinancialSummary } from "@/features/fundraisers/actions/fundraiserAllocation";
import {
	getActiveTeamsWithPlayers,
	getActiveTeams,
} from "@/features/teams/data/teams";

import FundraiserHeader from "@/features/fundraisers/FundraiserHeader";
import MoneyBreakdownSection from "@/features/fundraisers/MoneyBreakdownSection";
import DistributionSection from "@/features/fundraisers/DistributionSection";

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
		<main className="mx-auto w-full max-w-2xl space-y-4 p-4 sm:px-6">
			{/* Summary Card */}
			<FundraiserHeader
				fundraiser={fundraiser}
				financialSummary={financialSummary}
				fundraiserTeams={teams}
				participants={participants}
			/>

			{/* Money Breakdown */}
			<MoneyBreakdownSection
				fundraiserId={fundraiser.id}
				status={fundraiser.status}
				total={financialSummary.totalRaised}
				funds={contributions}
			/>

			{/* Participant Distribution */}
			<DistributionSection
				fundraiserId={fundraiser.id}
				status={fundraiser.status}
				selectedTeamIds={teams.map((team) => team.id)}
				participants={participants}
				activeTeams={activeTeams}
				activeRosters={activeTeamsWithPlayers}
				financialSummary={financialSummary}
				activeAllocations={activeAllocations}
			/>
		</main>
	);
}
