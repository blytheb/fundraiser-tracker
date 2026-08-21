// import React from "react";
// import InfoCard from "@/components/InfoCard";
// import ImageHorizontalCard from "@/components/ImageHorizontalCard";
// import IconHorizontalCard from "@/components/IconHorizontalCard";
// import TeamActions from "@/components/teams/TeamActions";

// import type { Team } from "@/types/team";

// export default function page() {
// 	const varsteam: Team = {
// 		id: 1,
// 		name: "Varsity",
// 		status: "IN_SEASON",
// 		imageUrl: "https://robohash.org/1?set=set2",
// 	};
// 	const jvteam: Team = {
// 		id: 1,
// 		name: "JV Girls",
// 		status: "IN_SEASON",
// 		imageUrl: "https://robohash.org/2?set=set2",
// 	};
// 	return (
// 		<div className="space-y-2 px-2 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 md:gap-3">
// 			<ImageHorizontalCard
// 				image={varsteam.imageUrl}
// 				heading={varsteam.name}
// 				subheading={varsteam.status}
// 				actions={<TeamActions team={varsteam} />}
// 			/>
// 			<ImageHorizontalCard
// 				image={jvteam.imageUrl}
// 				heading={jvteam.name}
// 				subheading={jvteam.status}
// 				actions={<TeamActions team={jvteam} />}
// 			/>

// 			<IconHorizontalCard
// 				icon={"https://robohash.org/1"}
// 				name="Jane Doe"
// 				description="Varsity Team"
// 			/>
// 			<IconHorizontalCard
// 				icon={"https://robohash.org/1"}
// 				name="McDoanlds Fundraiser"
// 				description="January 12, 2025"
// 			/>

// 			<InfoCard
// 				image={varsteam.imageUrl}
// 				heading={varsteam.name}
// 				subheading={varsteam.status}
// 				actions={<TeamActions team={varsteam} />}
// 			/>
// 		</div>
// 	);
// }

"use client";

import { Plus, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const fundraiser = {
	name: "Fall Tournament Fundraiser",
	status: "Completed",
	date: "August 15, 2026",
	teams: ["18U"],
};

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

const participants = [
	{ id: 1, name: "Emma Johnson", amount: 167.86 },
	{ id: 2, name: "Sophia Lee", amount: 167.86 },
	{ id: 3, name: "Mia Garcia", amount: 167.86 },
	{ id: 4, name: "Ava Smith", amount: 167.86 },
	{ id: 5, name: "Olivia Brown", amount: 167.86 },
];

const totalRaised = funds.reduce((total, fund) => total + fund.amount, 0);

export default function FundraiserPage() {
	return (
		<main className="mx-auto w-full max-w-2xl space-y-4 px-4 py-4 sm:px-6">
			{/* Header */}
			<div className="flex items-center gap-2">
				<Button variant="ghost" size="icon" className="-ml-2">
					<ChevronLeft className="h-5 w-5" />
				</Button>

				<h1 className="text-lg font-semibold">Fundraiser</h1>
			</div>

			{/* Summary Card */}
			<Card className="overflow-hidden">
				<CardContent className="p-5">
					<div className="flex items-start justify-between gap-4">
						<div>
							<p className="text-lg font-semibold">{fundraiser.name}</p>

							<p className="mt-1 text-sm text-muted-foreground">
								{fundraiser.date}
							</p>
						</div>

						<Badge variant="secondary">{fundraiser.status}</Badge>
					</div>

					<div className="mt-6">
						<p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
							Total Raised
						</p>

						<p className="mt-1 text-4xl font-bold tracking-tight">
							$
							{totalRaised.toLocaleString("en-US", {
								minimumFractionDigits: 2,
								maximumFractionDigits: 2,
							})}
						</p>
					</div>

					<div className="mt-5 flex gap-6 text-sm">
						<div>
							<p className="font-semibold">{participants.length}</p>
							<p className="text-muted-foreground">Participants</p>
						</div>

						<div>
							<p className="font-semibold">{fundraiser.teams.join(", ")}</p>
							<p className="text-muted-foreground">Team</p>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Money Breakdown */}
			<Card>
				<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
					<CardTitle className="text-base">Money Breakdown</CardTitle>

					<Button size="sm" variant="outline">
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

							<span className="font-medium">
								$
								{fund.amount.toLocaleString("en-US", {
									minimumFractionDigits: 2,
									maximumFractionDigits: 2,
								})}
							</span>
						</div>
					))}

					<Separator />

					<div className="flex items-center justify-between">
						<span className="font-medium">Total Raised</span>

						<span className="text-lg font-bold">
							$
							{totalRaised.toLocaleString("en-US", {
								minimumFractionDigits: 2,
								maximumFractionDigits: 2,
							})}
						</span>
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
								<p className="text-sm font-medium">{participant.name}</p>

								<p className="text-xs text-muted-foreground">
									{fundraiser.teams[0]}
								</p>
							</div>

							<p className="font-semibold">
								$
								{participant.amount.toLocaleString("en-US", {
									minimumFractionDigits: 2,
									maximumFractionDigits: 2,
								})}
							</p>
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

						<span className="font-medium">{fundraiser.date}</span>
					</div>

					<div className="flex justify-between gap-4 text-sm">
						<span className="text-muted-foreground">Teams</span>

						<span className="font-medium">{fundraiser.teams.join(", ")}</span>
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
