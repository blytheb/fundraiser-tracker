"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import SelectFundraiserRoster from "@/components/forms/fundraisers/SelectFundraiserRoster";
import CalculateEqualDistributionButton from "@/components/buttons/CalculateEqualDistributionButton";
import { setCustomDistribution } from "@/features/fundraisers/actions/fundraiserAllocation";
import { TeamWithPlayers } from "@/features/teams/types";
import type { Team, AllocationStatus } from "@prisma/client";
import { FundraiserParticipantWithPlayer } from "@/features/fundraisers/types";

type SectionProps = {
	fundraiserId: string;
	isCompleted: boolean;
	selectedTeamIds: string[];
	participants: FundraiserParticipantWithPlayer[];
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
	isCompleted,
	selectedTeamIds,
	participants,
	activeTeams,
	activeRosters,
	financialSummary,
	activeAllocations,
}: SectionProps) {
	const router = useRouter();
	const [amounts, setAmounts] = useState<Record<string, string>>({});

	const allocatedByParticipant = activeAllocations.reduce((map, allocation) => {
		const current = map.get(allocation.fundraiserParticipantId) ?? 0;

		map.set(allocation.fundraiserParticipantId, current + allocation.amount);

		return map;
	}, new Map<string, number>());

	useEffecct(() => {
		const initialAmounts: Record<string, string> = {};

		participants.forEach((participant) => {
			const allocated = allocatedByParticipant.get(participant.id) ?? 0;
			initialAmounts[participant.id] = allocated.toFixed(2);
		});
		setAmounts(initialAmounts);
	}, [participants, activeAllocations]);

	const allocationTotal = participants.reduce((total, participant) => {
		return total + (Number(amounts[participant.id]) || 0);
	}, 0);

	const remainingToAllocate =
		financialSummary.availableToAllocate - allocationTotal;

	async function handleSaveDistribution() {
		const allocations = participants.map((participant) => ({
			participantId: participant.id,
			amount: Number(amounts[participant.id] || 0),
		}));

		try {
			await setCustomDistribution(fundraiserId, allocations);
			setAmounts({});
			router.refresh();
		} catch (error) {
			console.error(error);
		}
	}

	return (
		<Card>
			<CardHeader>
				<div className="flex items-center justify-between">
					<div>
						<CardTitle className="text-base">Participant Breakdown</CardTitle>
					</div>
					<div className="flex items-center gap-2">
						{!isCompleted && (
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
						<span className="text-right">Allocation</span>
					</div>
					{participants.map((participant) => {
						return (
							<div
								key={participant.id}
								className="grid grid-cols-[1fr_120px] items-center rounded-lg p-2 text-sm hover:bg-muted/50">
								<div>
									<p className="font-medium">
										{participant.player.firstName} {participant.player.lastName}
									</p>
								</div>
								{!isCompleted ? (
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
									<p className="text-right">
										$
										{(allocatedByParticipant.get(participant.id) ?? 0).toFixed(
											2,
										)}
									</p>
								)}
							</div>
						);
					})}
				</div>
				<div className="border-t pt-3">
					<div className="flex justify-end gap-4 px-3">
						<span className="font-semibold">Total Raised</span>
						<span className="font-semibold">
							${financialSummary.totalRaised.toFixed(2)}
						</span>
					</div>

					<div className="flex justify-end gap-4 px-3">
						<span className="font-semibold">Allocated</span>
						<span className="font-semibold">${allocationTotal.toFixed(2)}</span>
					</div>

					<div className="flex justify-end gap-4 px-3">
						<span className="font-semibold">Remaining</span>
						<span className="font-semibold">
							${remainingToAllocate.toFixed(2)}
						</span>
					</div>

					{remainingToAllocate > 0 && (
						<p className="flex justify-end px-3 pt-1 text-sm text-destructive">
							${remainingToAllocate.toFixed(2)} still needs to be allocated
						</p>
					)}

					{remainingToAllocate < 0 && (
						<p className="flex justify-end px-3 pt-1 text-sm text-destructive">
							${Math.abs(remainingToAllocate).toFixed(2)} over the amount raised
						</p>
					)}
				</div>
				<Button
					disabled={isCompleted || Math.abs(remainingToAllocate) > 0.001}
					onClick={handleSaveDistribution}>
					Save Distribution
				</Button>
			</CardContent>
		</Card>
	);
}
