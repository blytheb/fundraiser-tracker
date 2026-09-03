"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";

import { saveFundraiserTeams } from "@/features/fundraisers/actions/fundraiserTeams";
import { saveFundraiserParticipants } from "@/features/fundraisers/actions/fundraiserParticipants";
import { TeamWithPlayers } from "@/features/teams/types";
import type { Team } from "@prisma/client";

type SelectFundraiserRosterProps = {
	fundraiserId: string;
	selectedTeamIds: string[];
	selectedParticipantIds: string[];
	availableTeams: Team[];
	availableRosters: TeamWithPlayers[];
};

export default function SelectFundraiserRoster({
	fundraiserId,
	selectedTeamIds,
	selectedParticipantIds,
	availableTeams,
	availableRosters,
}: SelectFundraiserRosterProps) {
	const router = useRouter();

	const [open, setOpen] = useState(false);
	const [step, setStep] = useState<"teams" | "participants">("teams");

	const [selectedTeamIdsState, setSelectedTeamIdsState] =
		useState<string[]>(selectedTeamIds);

	const [selectedParticipantIdsState, setSelectedParticipantIdsState] =
		useState<string[]>(selectedParticipantIds);

	// // Reset the dialog state whenever it opens
	useEffect(() => {
		if (open) {
			setStep("teams");
			setSelectedTeamIdsState(selectedTeamIds);
			setSelectedParticipantIdsState(selectedParticipantIds);
		}
	}, [open, selectedTeamIds, selectedParticipantIds]);

	// Only show rosters for currently selected teams
	const selectedRosters = availableRosters.filter((team) =>
		selectedTeamIdsState.includes(team.id),
	);

	// Get all players who are currently eligible
	// based on the selected teams.
	const eligiblePlayerIds = new Set(
		selectedRosters.flatMap((team) => team.players.map((player) => player.id)),
	);

	function toggleTeam(teamId: string) {
		setSelectedTeamIdsState((current) => {
			const isSelected = current.includes(teamId);

			if (isSelected) {
				// Remove the team
				return current.filter((id) => id !== teamId);
			}

			// Add the team
			return [...current, teamId];
		});
	}

	function toggleParticipant(playerId: string) {
		setSelectedParticipantIdsState((current) => {
			if (current.includes(playerId)) {
				return current.filter((id) => id !== playerId);
			}

			return [...current, playerId];
		});
	}

	function handleNext() {
		// Remove any participants who are no longer
		// eligible because their teams were removed.
		setSelectedParticipantIdsState((current) =>
			current.filter((playerId) => eligiblePlayerIds.has(playerId)),
		);

		setStep("participants");
	}

	function handleBack() {
		setStep("teams");
	}

	async function handleSave() {
		try {
			// Save the teams first.
			// This also removes participants who are no longer
			// eligible on the server.
			await saveFundraiserTeams(fundraiserId, selectedTeamIdsState);

			// Then save the participant selections.
			await saveFundraiserParticipants(
				fundraiserId,
				selectedParticipantIdsState,
			);

			setOpen(false);
			setStep("teams");

			router.refresh();
		} catch (error) {
			console.error("Error saving fundraiser:", error);
		}
	}

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger render={<Button>Manage Participants</Button>} />

			<DialogContent>
				{step === "teams" ? (
					<>
						<DialogHeader>
							<DialogTitle>Select Teams</DialogTitle>
							<DialogDescription>
								Select the teams participating in this fundraiser.
							</DialogDescription>
						</DialogHeader>

						<div className="space-y-4 py-4">
							{availableTeams.map((team) => (
								<div key={team.id} className="flex items-center gap-2">
									<input
										type="checkbox"
										id={`team-${team.id}`}
										checked={selectedTeamIdsState.includes(team.id)}
										onChange={() => toggleTeam(team.id)}
									/>

									<label htmlFor={`team-${team.id}`}>{team.name}</label>
								</div>
							))}
						</div>

						<DialogFooter>
							<Button
								type="button"
								variant="outline"
								onClick={() => setOpen(false)}>
								Cancel
							</Button>

							<Button type="button" onClick={handleNext}>
								Next
							</Button>
						</DialogFooter>
					</>
				) : (
					<>
						<DialogHeader>
							<DialogTitle>Select Participants</DialogTitle>
							<DialogDescription>
								Select the players participating in this fundraiser.
							</DialogDescription>
						</DialogHeader>

						<div className="max-h-[400px] space-y-6 overflow-y-auto py-4">
							{selectedRosters.length === 0 ? (
								<p className="text-sm text-muted-foreground">
									No teams selected. Go back and select at least one team.
								</p>
							) : (
								selectedRosters.map((team) => (
									<div key={team.id} className="space-y-3">
										<h3 className="font-semibold">{team.name}</h3>

										<div className="space-y-2">
											{team.players.map((player) => (
												<div
													key={player.id}
													className="flex items-center gap-2">
													<input
														type="checkbox"
														id={`player-${player.id}`}
														checked={selectedParticipantIdsState.includes(
															player.id,
														)}
														onChange={() => toggleParticipant(player.id)}
													/>

													<label htmlFor={`player-${player.id}`}>
														{player.firstName} {player.lastName}
													</label>
												</div>
											))}
										</div>
									</div>
								))
							)}
						</div>

						<DialogFooter>
							<Button type="button" variant="outline" onClick={handleBack}>
								Back
							</Button>

							<Button type="button" onClick={handleSave}>
								Save
							</Button>
						</DialogFooter>
					</>
				)}
			</DialogContent>
		</Dialog>
	);
}
