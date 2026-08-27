import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { getFundraiserById } from "@/features/fundraisers/data/fundraisers";
import { getFundraiserTeams } from "@/features/fundraisers/data/fundraiserTeams";
import { getActiveTeams } from "@/features/teams/data/teams";
import {
	getFundraiserFunds,
	getFundraiserTotal,
} from "@/features/fundraisers/data/fundraiserFunds";
import {
	getFundraiserParticipants,
	getEligibleFundraiserPlayers,
} from "@/lib/data/fundraiserParticipants";

import SummarySection from "@/features/fundraisers/SummarySection";
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

	const [fundraiser, teams, participants, funds, total] = await Promise.all([
		getFundraiserById(fundraiserId),
		getFundraiserTeams(fundraiserId),
		getFundraiserParticipants(fundraiserId),
		getFundraiserFunds(fundraiserId),
		getFundraiserTotal(fundraiserId),
	]);

	// const totalRaised =
	// 	funds.reduce((total, fund) => total + Number(fund.amount), 0) ?? 0;

	return (
		<main className="mx-auto w-full max-w-2xl space-y-4 p-4 sm:px-6">
			{/* Summary Card */}
			<SummarySection
				fundraiser={fundraiser}
				totalRaised={total}
				fundraiserTeams={teams}
				participants={participants}
			/>
			{/* Money Breakdown */}
			<MoneyBreakdownSection
				fundraiserId={fundraiser.id}
				total={total}
				funds={funds}
			/>

			{/* Participant Distribution */}
			<DistributionSection participants={participants} />
			{/* Details */}
			<DetailSection fundraiser={fundraiser} teams={teams} />
		</main>
	);
}
