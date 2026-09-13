"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import SelectFundraiserRoster from "@/components/forms/fundraisers/SelectFundraiserRoster";
import CalculateEqualDistributionButton from "@/components/buttons/CalculateEqualDistributionButton";
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
	const [amounts, setAmounts] = useState<Record<string, string>>({});

	const totalDistributed = participants.reduce((total, participant) => {
		return total + (Number(amounts[participant.id]) || 0);
	}, 0);

	const totalRemaining = totalRaised - totalDistributed;

	useEffect(() => {
		const initialAmounts: Record<string, string> = {};

		participants.forEach((participant) => {
			initialAmounts[participant.id] = participant.allocatedAmount.toFixed(2);
		});

		setAmounts(initialAmounts);
	}, [participants]);
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
					<div className="flex items-center gap-2">
						<SelectFundraiserRoster
							fundraiserId={fundraiserId}
							selectedTeamIds={selectedTeamIds}
							selectedParticipantIds={participants.map(
								(participant) => participant.playerId,
							)}
							availableTeams={activeTeams}
							availableRosters={activeRosters}
						/>
					</div>

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
								<Input
									type="number"
									min="0"
									step="0.01"
									value={amounts[participant.id] ?? ""}
									onChange={(e) => {
										setAmounts((prev) => ({
											...prev,
											[participant.id]: e.target.value,
										}));
									}}
									className="w-28 text-right"
								/>
							</div>
						);
					})}
				</div>
				<div className="border-t pt-3">
					<div className="flex justify-between px-3 text-sm">
						<span className="font-medium">Total</span>
						<span className="font-medium">
							${totalDistributed.toFixed(2)} / ${totalRaised.toFixed(2)}
						</span>
					</div>

					{totalRemaining > 0 && (
						<p className="px-3 pt-1 text-sm text-muted-foreground">
							${totalRemaining.toFixed(2)} remaining
						</p>
					)}

					{totalRemaining < 0 && (
						<p className="px-3 pt-1 text-sm text-destructive">
							${Math.abs(totalRemaining).toFixed(2)} over the available amount
						</p>
					)}
				</div>
				<div className="flex flex-col">
					<CalculateEqualDistributionButton
						fundraiserId={fundraiserId}
						totalRaised={totalRaised}
					/>
					<Button disabled={Math.abs(totalRemaining) > 0.001}>
						Save Distribution
					</Button>
				</div>
			</CardContent>
		</Card>
	);
}
