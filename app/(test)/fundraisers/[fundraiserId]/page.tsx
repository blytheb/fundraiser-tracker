// import React from "react";

// import PageHeader from "@/components/PageHeader";
// import FundraiserDetail from "@/components/fundraisers/details/FundraiserDetail";
// import FundraiserTeams from "@/components/fundraisers/details/FundraiserTeams";
// import FundraiserParticipants from "@/components/fundraisers/details/FundraiserParticipants";

// import { getFundraiserById } from "@/lib/data/fundraisers";
// import { getActiveTeams } from "@/lib/data/teams";
// import { getFundraiserTeams } from "@/lib/data/fundraiserTeams";
// import {
// 	getEligibleFundraiserPlayers,
// 	getFundraiserParticipants,
// } from "@/lib/data/fundraiserParticipants";
// import DistributeFundsDialog from "@/components/fundraisers/forms/DistributeFundsDialog";
// import { Badge } from "@/components/ui/badge";

// type PageProps = {
// 	params: Promise<{
// 		fundraiserId: string;
// 	}>;
// };

// export default async function FundraiserPage({ params }: PageProps) {
// 	const { fundraiserId } = await params;

// 	const [
// 		fundraiser,
// 		fundraiserTeams,
// 		activeTeams,
// 		fundraiserParticipants,
// 		eligiblePlayers,
// 	] = await Promise.all([
// 		getFundraiserById(fundraiserId),
// 		getFundraiserTeams(fundraiserId),
// 		getActiveTeams(),
// 		getFundraiserParticipants(fundraiserId),
// 		getEligibleFundraiserPlayers(fundraiserId),
// 	]);

// 	return (
// 		<div className="space-y-6 p-6">
// 			<div className="flex flex-col border text-center items-center justify-center">
// 				<h1>{fundraiser.name}</h1>
// 				<p>$0.00</p>
// 				<p>{fundraiser.description}</p>
// 				<div className="space-x-2 py-2">
// 					{fundraiserTeams.length === 0 ? (
// 						<Badge>NoTeams</Badge>
// 					) : (
// 						fundraiserTeams.map((team) => (
// 							<Badge variant="outline" key={team.id}>
// 								{team.name}
// 							</Badge>
// 						))
// 					)}
// 				</div>
// 			</div>
// 			<DistributeFundsDialog
// 				fundraiserId={fundraiser.id}
// 				totalAmount={Number(fundraiser.totalAmount)}
// 				participants={fundraiserParticipants}
// 			/>
// 			{/* <FundraiserDetail fundraiser={fundraiser} /> */}

// 			<div className="grid gap-6 lg:grid-cols-2">
// 				<FundraiserParticipants
// 					fundraiserId={fundraiserId}
// 					selectedPlayers={fundraiserParticipants}
// 					eligiblePlayers={eligiblePlayers}
// 				/>
// 			</div>
// 		</div>
// 	);
// }

import PageHeader from "@/components/PageHeader";
import FundraiserParticipants from "@/components/fundraisers/details/FundraiserParticipants";
import DistributeFundsDialog from "@/components/fundraisers/forms/DistributeFundsDialog";

import { getFundraiserById } from "@/lib/data/fundraisers";
import { getActiveTeams } from "@/lib/data/teams";
import { getFundraiserTeams } from "@/lib/data/fundraiserTeams";
import {
	getEligibleFundraiserPlayers,
	getFundraiserParticipants,
} from "@/lib/data/fundraiserParticipants";

import { Badge } from "@/components/ui/badge";
import { Users, Wallet, UsersRound } from "lucide-react";

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

	if (!fundraiser) {
		return <div>Fundraiser not found</div>;
	}

	const totalAmount = Number(fundraiser.totalAmount);

	return (
		<div className="mx-auto w-full max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
			{/* Fundraiser overview */}
			<section className="rounded-xl border bg-card p-5">
				<div className="space-y-4">
					<div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
						<div className="space-y-1">
							<p className="text-sm text-muted-foreground">Fundraiser</p>

							<h1 className="text-2xl font-semibold tracking-tight">
								{fundraiser.name}
							</h1>

							<p className="text-sm text-muted-foreground">
								{fundraiser.description}
							</p>
						</div>

						<Badge>{fundraiser.status}</Badge>
					</div>

					{/* Teams */}
					<div className="space-y-2">
						<p className="text-sm font-medium">Teams</p>

						{fundraiserTeams.length === 0 ? (
							<Badge variant="outline">No teams</Badge>
						) : (
							<div className="flex flex-wrap gap-2">
								{fundraiserTeams.map((team) => (
									<Badge variant="outline" key={team.id}>
										{team.name}
									</Badge>
								))}
							</div>
						)}
					</div>
				</div>
			</section>

			{/* Summary */}
			<section className="grid grid-cols-1 gap-3 sm:grid-cols-3">
				<div className="rounded-xl border p-4">
					<div className="flex items-center gap-2 text-muted-foreground">
						<Wallet className="size-4" />
						<span className="text-sm">Total Raised</span>
					</div>

					<p className="mt-2 text-2xl font-semibold">
						${totalAmount.toFixed(2)}
					</p>
				</div>

				<div className="rounded-xl border p-4">
					<div className="flex items-center gap-2 text-muted-foreground">
						<Users className="size-4" />
						<span className="text-sm">Participants</span>
					</div>

					<p className="mt-2 text-2xl font-semibold">
						{fundraiserParticipants.length}
					</p>
				</div>

				<div className="rounded-xl border p-4">
					<div className="flex items-center gap-2 text-muted-foreground">
						<UsersRound className="size-4" />
						<span className="text-sm">Teams</span>
					</div>

					<p className="mt-2 text-2xl font-semibold">
						{fundraiserTeams.length}
					</p>
				</div>
			</section>

			{/* Main content */}
			<section className="space-y-4">
				<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
					<div>
						<h2 className="text-lg font-semibold">Participants</h2>

						<p className="text-sm text-muted-foreground">
							Manage the players participating in this fundraiser.
						</p>
					</div>

					<DistributeFundsDialog
						fundraiserId={fundraiser.id}
						totalAmount={totalAmount}
						participants={fundraiserParticipants}
					/>
				</div>

				<FundraiserParticipants
					fundraiserId={fundraiserId}
					selectedPlayers={fundraiserParticipants}
					eligiblePlayers={eligiblePlayers}
				/>
			</section>
		</div>
	);
}
