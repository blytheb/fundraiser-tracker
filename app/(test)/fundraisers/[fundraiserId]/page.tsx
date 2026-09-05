import { getFundraiserById } from "@/features/fundraisers/data/fundraisers";
import { getFundraiserTeams } from "@/features/fundraisers/data/fundraiserTeams";
import { getFundraiserContributions } from "@/features/fundraisers/data/fundraiserContributions";
import { getFundraiserParticipants } from "@/features/fundraisers/data/fundraiserParticipants";
import {
	getActiveTeamsWithPlayers,
	getActiveTeams,
} from "@/features/teams/data/teams";

import AddContribution from "@/components/forms/fundraisers/AddContribution";
import SelectFundraiserRoster from "@/components/forms/fundraisers/SelectFundraiserRoster";
import FundraiserHeader from "@/features/fundraisers/FundraiserHeader";
import MoneyBreakdownSection from "@/features/fundraisers/MoneyBreakdownSection";
import DistributionSection from "@/features/fundraisers/DistributionSection";
import DetailSection from "@/features/fundraisers/DetailSection";

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
		activeTeams,
		activeTeamsWithPlayers,
	] = await Promise.all([
		getFundraiserById(fundraiserId), //fundraiser info
		getFundraiserTeams(fundraiserId), //teams associated with fundraiser
		getFundraiserParticipants(fundraiserId), //participants associated with fundraiser
		getFundraiserContributions(fundraiserId), //contributions associated with fundraiser
		getActiveTeams(),
		getActiveTeamsWithPlayers(), //all active teams with players in the system
	]);

	const selectedTeamIds = new Set(teams.map((team) => team.id));

	const fundraiserRosters = activeTeamsWithPlayers.filter((team) =>
		selectedTeamIds.has(team.id),
	);

	const totalRaised = contributions.reduce(
		(total, contribution) => total + contribution.amount,
		0,
	);

	return (
		<main className="mx-auto w-full max-w-2xl space-y-4 p-4 sm:px-6">
			{/* Summary Card */}

			<SelectFundraiserRoster
				fundraiserId={fundraiser.id}
				selectedTeamIds={teams.map((team) => team.id)}
				selectedParticipantIds={participants.map(
					(participant) => participant.playerId,
				)}
				availableTeams={activeTeams}
				availableRosters={activeTeamsWithPlayers}
			/>

			<AddContribution fundraiserId={fundraiser.id} />

			<FundraiserHeader
				fundraiser={fundraiser}
				totalRaised={totalRaised}
				fundraiserTeams={teams}
				participants={participants}
			/>
			{/* Money Breakdown */}
			<MoneyBreakdownSection
				fundraiserId={fundraiser.id}
				total={totalRaised}
				funds={contributions}
			/>

			{/* Participant Distribution */}
			<DistributionSection participants={participants} />
			{/* Details */}
			<DetailSection fundraiser={fundraiser} teams={teams} />
		</main>
	);
}
