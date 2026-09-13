import React from "react";
// import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import SelectFundraiserRoster from "@/components/forms/fundraisers/SelectFundraiserRoster";
import CalculateDistributionButton from "@/components/buttons/CalculateDistributionButton";
import type { FundraiserParticipantWithPlayerSerialized } from "./types";
import { TeamWithPlayers } from "@/features/teams/types";
import type { Team } from "@prisma/client";

type SectionProps = {
	fundraiserId: string;
	selectedTeamIds: string[];
	participants: FundraiserParticipantWithPlayerSerialized[];
	activeTeams: Team[];
	activeRosters: TeamWithPlayers[];
	totalRaised: number;
};

export default function DistributionSection({
	fundraiserId,
	selectedTeamIds,
	participants,
	activeTeams,
	activeRosters,
	totalRaised,
}: SectionProps) {
	const totalDistributed = participants.reduce(
		(total, participant) => total + participant.allocatedAmount,
		0,
	);

	const totalRemaining = totalRaised - totalDistributed;
	return (
		<Card>
			<CardHeader>
				<div className="flex items-center justify-between">
					<div>
						<CardTitle className="text-base">
							Participant Distribution
						</CardTitle>
						{totalRemaining > 0 ? (
							<p className="mt-1 text-sm text-muted-foreground">
								${totalRemaining.toFixed(2)} remaining
							</p>
						) : (
							<p className="mt-1 text-sm text-muted-foreground">
								All funds are distributed
							</p>
						)}
					</div>
					<CalculateDistributionButton
						fundraiserId={fundraiserId}
						totalRaised={totalRaised}
					/>
					<SelectFundraiserRoster
						fundraiserId={fundraiserId}
						selectedTeamIds={selectedTeamIds}
						selectedParticipantIds={participants.map(
							(participant) => participant.playerId,
						)}
						availableTeams={activeTeams}
						availableRosters={activeRosters}
					/>

					{/* <ToggleGroup
						type="single"
						className="h-8 overflow-hidden rounded-md border gap-0">
						<ToggleGroupItem
							value="equal"
							className="h-8 rounded-none border-0 px-3 bg-amber-200">
							Equal
						</ToggleGroupItem>

						<ToggleGroupItem
							value="custom"
							className=" h-8 rounded-none border-0 px-3 bg-green-500">
							Custom
						</ToggleGroupItem>
					</ToggleGroup> */}
				</div>
			</CardHeader>

			<CardContent className="space-y-1">
				<div className="space-y-1">
					<div className="flex justify-between px-3 py-2 text-xs font-medium text-muted-foreground">
						<span>Player</span>
						<span className="text-right">Amount</span>
					</div>
					{participants.map((participant) => {
						return (
							<div
								key={participant.id}
								// className="grid grid-cols-3 items-center rounded-lg px-3 py-2 hover:bg-muted/50">
								className="flex items-center justify-between rounded-lg px-3 py-3 hover:bg-muted/50">
								<div>
									<p className="text-sm font-medium">
										{participant.player.firstName} {participant.player.lastName}
									</p>

									{/* <p className="text-xs text-muted-foreground">
										{fundraiser.teams[0]?.team.name}
									</p> */}
								</div>
								<p className="text-right text-sm">
									${participant.allocatedAmount.toFixed(2)}
								</p>
							</div>
						);
					})}
				</div>
			</CardContent>
		</Card>
	);
}
