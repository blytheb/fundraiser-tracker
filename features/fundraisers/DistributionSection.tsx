"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import SelectFundraiserRoster from "@/components/forms/fundraisers/SelectFundraiserRoster";
import CalculateEqualDistributionButton from "@/components/buttons/CalculateEqualDistributionButton";
import type { FundraiserParticipantWithPlayerSerialized } from "./types";
import { TeamWithPlayers } from "@/features/teams/types";
import type { Team, FundraiserStatus, AllocationStatus } from "@prisma/client";

type SectionProps = {
	fundraiserId: string;
	status: FundraiserStatus;
	selectedTeamIds: string[];
	participants: FundraiserParticipantWithPlayerSerialized[];
	activeTeams: Team[];
	activeRosters: TeamWithPlayers[];
	financialSummary: {
		totalRaised: number;
		currentlyAllocated: number;
		availableToAllocate: number;
		participantCount: number;
	};
	activeAllocations: {
		id: string;
		fundraiserParticipantId: string;
		amount: number;
		status: AllocationStatus;
	}[];
};

export default function DistributionSection({
	fundraiserId,
	status,
	selectedTeamIds,
	participants,
	activeTeams,
	activeRosters,
	financialSummary,
	activeAllocations,
}: SectionProps) {
	const isDraft = status === "DRAFT";
	const [amounts, setAmounts] = useState<Record<string, string>>({});

	const newAllocaitonTotal = participants.reduce((total, participant) => {
		return total + (Number(amounts[participant.id]) || 0);
	}, 0);

	const remainingToAllocate =
		financialSummary.availableToAllocate - newAllocaitonTotal;

	return (
		<Card>
			<CardHeader>
				<div className="flex items-center justify-between">
					<div>
						<CardTitle className="text-base">Participant Breakdown</CardTitle>
					</div>
					<div className="flex items-center gap-2">
						{isDraft && (
							<SelectFundraiserRoster
								fundraiserId={fundraiserId}
								selectedTeamIds={selectedTeamIds}
								selectedParticipantIds={participants.map(
									(participant) => participant.playerId,
								)}
								availableTeams={activeTeams}
								availableRosters={activeRosters}
							/>
						)}
					</div>
				</div>
			</CardHeader>

			<CardContent>
				<div>
					<div className="flex justify-between p-2 text-md font-semibold">
						<span>Player Name ({participants.length})</span>
						<span className="text-right">Amount</span>
					</div>
					{participants.map((participant) => {
						return (
							<div
								key={participant.id}
								className="flex items-center justify-between text-sm rounded-lg p-2 hover:bg-muted/50">
								<div>
									<p className="font-medium">
										{participant.player.firstName} {participant.player.lastName}
									</p>
								</div>
								{isDraft ? (
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
								) : (
									<p>${participant.allocatedAmount.toFixed(2)}</p>
								)}
							</div>
						);
					})}
				</div>
				<div className="border-t pt-3">
					<div className="flex justify-end px-3 gap-4">
						<span className="font-semibold">Total Raised</span>
						<span className="font-semibold">
							${financialSummary.totalRaised.toFixed(2)}
						</span>
					</div>
					<div className="flex justify-end px-3 gap-4">
						<span className="font-semibold">New Allocation</span>
						<span className="font-semibold">
							${newAllocaitonTotal.toFixed(2)}
						</span>
					</div>

					{remainingToAllocate > 0 && (
						<p className="flex justify-end px-3 pt-1 text-sm text-destructive">
							${Math.abs(remainingToAllocate).toFixed(2)} needs to be assigned
						</p>
					)}

					{remainingToAllocate < 0 && (
						<p className="flex justify-end px-3 pt-1 text-sm text-destructive">
							${Math.abs(remainingToAllocate).toFixed(2)} over the available
							amount
						</p>
					)}
				</div>
				<div className="pt-3"></div>

				{isDraft && (
					<div className="flex justify-end">
						<CalculateEqualDistributionButton
							fundraiserId={fundraiserId}
							totalRaised={financialSummary.totalRaised}
						/>
						<Button disabled={Math.abs(remainingToAllocate) > 0.001}>
							Save Distribution
						</Button>
					</div>
				)}

				<div className="border-t pt-3">
					<div className="flex justify-end px-3 gap-4">
						<span className="font-semibold">Total Raised</span>
						<span className="font-semibold">
							${financialSummary.totalRaised.toFixed(2)}
						</span>
					</div>

					<div className="flex justify-end px-3 gap-4">
						<span className="font-semibold">Currently Allocated</span>
						<span className="font-semibold">
							${financialSummary.currentlyAllocated.toFixed(2)}
						</span>
					</div>

					<div className="flex justify-end px-3 gap-4">
						<span className="font-semibold">Available to Allocate</span>
						<span className="font-semibold">
							${financialSummary.availableToAllocate.toFixed(2)}
						</span>
					</div>

					<div className="flex justify-end px-3 gap-4">
						<span className="font-semibold">New Allocation</span>
						<span className="font-semibold">
							${newAllocationTotal.toFixed(2)}
						</span>
					</div>

					{remainingToAllocate > 0 && (
						<p className="flex justify-end px-3 pt-1 text-sm text-destructive">
							${remainingToAllocate.toFixed(2)} still available
						</p>
					)}

					{remainingToAllocate < 0 && (
						<p className="flex justify-end px-3 pt-1 text-sm text-destructive">
							${Math.abs(remainingToAllocate).toFixed(2)} over the available
							amount
						</p>
					)}
				</div>
			</CardContent>
		</Card>
	);
}
