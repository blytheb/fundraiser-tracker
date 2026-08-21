import { Plus, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

import { getFundraiserById } from "@/lib/data/fundraisers";
import { getFundraiserTeams } from "@/lib/data/fundraiserTeams";
import { getActiveTeams } from "@/lib/data/teams";
import {
	getFundraiserParticipants,
	getEligibleFundraiserPlayers,
} from "@/lib/data/fundraiserParticipants";
import {
	Avatar,
	AvatarFallback,
	AvatarGroup,
	AvatarGroupCount,
	AvatarImage,
} from "@/components/ui/avatar";
// const fundraiser = {
// 	name: "Fall Tournament Fundraiser",
// 	status: "Completed",
// 	date: "August 15, 2026",
// 	teams: ["18U"],
// };

const funds = [
	{
		id: 1,
		description: "Event Profit",
		amount: 2000,
	},
	{
		id: 2,
		description: "Tips",
		amount: 350,
	},
];

const totalRaised = funds.reduce((total, fund) => total + fund.amount, 0);

type PageProps = {
	params: Promise<{
		teamId: string;
	}>;
};
export default async function FundraiserPage({ params }: PageProps) {
	const { fundraiserId } = await params;

	const [
		fundraiser,
		fundraiserTeams,
		activeTeams,
		participants,
		eligiblePlayers,
	] = await Promise.all([
		getFundraiserById(fundraiserId),
		getFundraiserTeams(fundraiserId),
		getActiveTeams(),
		getFundraiserParticipants(fundraiserId),
		getEligibleFundraiserPlayers(fundraiserId),
	]);

	return (
		<main className="mx-auto w-full max-w-2xl space-y-4 px-4 py-4 sm:px-6">
			{/* Summary Card */}
			<Card className="overflow-hidden bg-gray-200">
				<CardContent className="p-5">
					<div className="flex items-start justify-between gap-4">
						<div>
							<p className="text-lg font-semibold">{fundraiser.name}</p>

							<p className="mt-1 text-sm text-muted-foreground">
								{fundraiser.startDate.toLocaleDateString()}
							</p>
						</div>

						<Badge variant="secondary">{fundraiser.status}</Badge>
					</div>

					<div className="mt-6">
						<p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
							Total Raised
						</p>
						<p>$ --- </p>

						{/* <p className="mt-1 text-4xl font-bold tracking-tight">
							$
							{totalRaised.toLocaleString("en-US", {
								minimumFractionDigits: 2,
								maximumFractionDigits: 2,
							})}
						</p> */}
					</div>

					<div className="mt-5 flex gap-6 text-sm items-center">
						<AvatarGroup className="grayscale">
							{participants.map((participant) => (
								<Avatar key={participant.id}>
									<AvatarImage
										src={participant.imageUrl}
										alt={participant.firstName}
									/>
									<AvatarFallback>AA</AvatarFallback>
								</Avatar>
							))}

							<Avatar>
								<AvatarImage
									src="https://github.com/maxleiter.png"
									alt="@maxleiter"
								/>
								<AvatarFallback>LR</AvatarFallback>
							</Avatar>
							<Avatar>
								<AvatarImage
									src="https://github.com/evilrabbit.png"
									alt="@evilrabbit"
								/>
								<AvatarFallback>ER</AvatarFallback>
							</Avatar>
							<AvatarGroupCount>+3</AvatarGroupCount>
						</AvatarGroup>

						<div className="space-x-2">
							{fundraiserTeams.map((team) => (
								<Badge key={team.id}>{team.name}</Badge>
							))}
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Money Breakdown */}
			<Card>
				<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
					<CardTitle className="text-base">Money Breakdown</CardTitle>

					<Button size="sm">
						<Plus className="mr-1.5 h-4 w-4" />
						Add Funds
					</Button>
				</CardHeader>

				<CardContent className="space-y-3">
					{funds.map((fund) => (
						<div
							key={fund.id}
							className="flex items-center justify-between text-sm">
							<span className="text-muted-foreground">{fund.description}</span>

							{/* <span className="font-medium">
								$
								{fund.amount.toLocaleString("en-US", {
									minimumFractionDigits: 2,
									maximumFractionDigits: 2,
								})}
							</span> */}
						</div>
					))}

					<Separator />

					<div className="flex items-center justify-between">
						<span className="font-medium">Total Raised</span>

						{/* <span className="text-lg font-bold">
							$
							{totalRaised.toLocaleString("en-US", {
								minimumFractionDigits: 2,
								maximumFractionDigits: 2,
							})}
						</span> */}
					</div>
				</CardContent>
			</Card>

			{/* Participant Distribution */}
			<Card>
				<CardHeader>
					<div className="flex items-center justify-between">
						<div>
							<CardTitle className="text-base">
								Participant Distribution
							</CardTitle>

							<p className="mt-1 text-sm text-muted-foreground">
								{participants.length} participants
							</p>
						</div>

						<p className="text-sm font-medium">Equal</p>
					</div>
				</CardHeader>

				<CardContent className="space-y-1">
					{participants.map((participant) => (
						<div
							key={participant.id}
							className="flex items-center justify-between rounded-lg px-3 py-3 hover:bg-muted/50">
							<div>
								<p className="text-sm font-medium">
									{participant.firstName} {participant.lastName}
								</p>

								<p className="text-xs text-muted-foreground">
									{fundraiser.teams[0]?.team.name}
								</p>
							</div>
							{/* 
							<p className="font-semibold">
								$
								{participant.amount.toLocaleString("en-US", {
									minimumFractionDigits: 2,
									maximumFractionDigits: 2,
								})}
							</p> */}
						</div>
					))}
				</CardContent>
			</Card>

			{/* Details */}
			<Card>
				<CardHeader>
					<CardTitle className="text-base">Fundraiser Details</CardTitle>
				</CardHeader>

				<CardContent className="space-y-4">
					<div className="flex justify-between gap-4 text-sm">
						<span className="text-muted-foreground">Date</span>

						<span className="font-medium">
							{fundraiser.startDate.toLocaleDateString()}
						</span>
					</div>

					<div className="flex justify-between gap-4 text-sm">
						<span className="text-muted-foreground">Teams</span>

						<span className="font-medium">
							{fundraiser.teams
								.map((fundraiserTeam) => fundraiserTeam.team.name)
								.join(", ")}
						</span>
					</div>

					<div className="flex justify-between gap-4 text-sm">
						<span className="text-muted-foreground">Participants</span>

						<span className="font-medium">{participants.length}</span>
					</div>

					<div className="flex justify-between gap-4 text-sm">
						<span className="text-muted-foreground">Distribution</span>

						<span className="font-medium">Equal</span>
					</div>
				</CardContent>
			</Card>
		</main>
	);
}
