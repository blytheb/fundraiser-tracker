import React from "react";
// import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import CalculateDistributionButton from "@/components/buttons/CalculateDistributionButton";
import type { FundraiserParticipantWithPlayerSerialized } from ".../types";

type SectionProps = {
	fundraiserId: string;
	participants: FundraiserParticipantWithPlayerSerialized[];
	totalRaised: number;
};

export default function DistributionSection({
	fundraiserId,
	participants,
	totalRaised,
}: SectionProps) {
	const totalAllocated = participants.reduce(
		(total, participant) => total + participant.allocatedAmount,
		0,
	);

	const totalDistributed = 0;
	const totalRemaining = totalRaised - totalAllocated;
	return (
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
					<CalculateDistributionButton
						fundraiserId={fundraiserId}
						totalRaised={totalRaised}
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
				<div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
					<div>
						<p className="text-sm text-muted-foreground">Total Raised:</p>
						<p className="text-lg font-semibold">${totalRaised.toFixed(2)}</p>
					</div>
					<div>
						<p className="text-sm text-muted-foreground">Allocated:</p>
						<p className="text-lg font-semibold">
							${totalAllocated.toFixed(2)}
						</p>
					</div>
					<div>
						<p className="text-sm text-muted-foreground">Distributed:</p>
						<p className="text-lg font-semibold">
							${totalDistributed.toFixed(2)}
						</p>
					</div>
					<div>
						<p className="text-sm text-muted-foreground">Remaining</p>
						<p className="text-lg font-semibold">
							{" "}
							${totalRemaining.toFixed(2)}
						</p>
					</div>
				</div>
				<div className="space-y-1">
					<div className="grid grid-cols-4 px-3 py-2 text-xs font-medium text-muted-foreground">
						<span>Planyer</span>
						<span className="text-right">Allocated</span>
						<span className="text-right">Distributed</span>
						<span className="text-right">Remaining</span>
					</div>
					{participants.map((participant) => {
						const allocated = participant.allocatedAmount;
						const distributed = 0;
						const remaining = allocated - distributed;
						return (
							<div
								key={participant.id}
								className="grid grid-cols-4 items-center rounded-lg px-3 py-2 hover:bg-muted/50">
								{/* className="flex items-center justify-between rounded-lg px-3 py-3 hover:bg-muted/50" */}

								<div>
									<p className="text-sm font-medium">
										{participant.player.firstName} {participant.player.lastName}
									</p>

									{/* <p className="text-xs text-muted-foreground">
									{fundraiser.teams[0]?.team.name}
								</p> */}
								</div>
								<p className="text-right text-sm">${allocated.toFixed(2)}</p>
								<p className="text-right text-sm">${distributed.toFixed(2)}</p>
								<p className="text-right text-sm">${remaining.toFixed(2)}</p>
							</div>
						);
					})}
				</div>
			</CardContent>
		</Card>
	);
}
