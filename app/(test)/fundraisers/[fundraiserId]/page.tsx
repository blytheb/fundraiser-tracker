import { getFundraiserById } from "@/features/fundraisers/data/fundraisers";
import { getFundraiserTeams } from "@/features/fundraisers/data/fundraiserTeams";
import { getFundraiserParticipants } from "@/features/fundraisers/data/fundraiserParticipants";
import { getActiveTeams } from "@/features/teams/data/teams";

import SelectTeamsDialog from "@/components/forms/fundraisers/SelectTeamsDialog";
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

	const [fundraiser, teams, participants, activeTeams] = await Promise.all([
		getFundraiserById(fundraiserId),
		getFundraiserTeams(fundraiserId),
		getFundraiserParticipants(fundraiserId),
		getActiveTeams(),
	]);

	// const totalRaised =
	// 	funds.reduce((total, fund) => total + Number(fund.amount), 0) ?? 0;

	return (
		<main className="mx-auto w-full max-w-2xl space-y-4 p-4 sm:px-6">
			{/* Summary Card */}
			<SelectTeamsDialog
				fundraiserId={fundraiser.id}
				selectedTeamIds={teams.map((team) => team.id)}
				availableTeams={activeTeams}
			/>
			<FundraiserHeader
				fundraiser={fundraiser}
				totalRaised={100}
				fundraiserTeams={teams}
				participants={participants}
			/>
			{/* Money Breakdown */}
			<MoneyBreakdownSection
				fundraiserId={fundraiser.id}
				total={100}
				funds={[]}
			/>

			{/* Participant Distribution */}
			<DistributionSection participants={participants} />
			{/* Details */}
			<DetailSection fundraiser={fundraiser} teams={teams} />
		</main>
	);
}
