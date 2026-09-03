"use client";

import { useRouter } from "next/navigation";
import { saveFundraiserParticipants } from "@/features/fundraisers/actions/fundraiserParticipants";

import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

import { TeamWithPlayers } from "@features/teams/types";

type SelectParticipantsProps = {
	fundraiserId: string;
	selectedParticipantIds: string[];
	availableRosters: TeamWithPlayers[];
};

export default function SelectParticipants({
	fundraiserId,
	selectedParticipantIds,
	availableRosters,
}: SelectParticipantsProps) {
	const router = useRouter();
	const [open, setOpen] = useState(false);

	const [selectedIds, setSelectedIds] = useState<string[]>(
		selectedParticipantIds,
	);

	useEffect(() => {
		setSelectedIds(selectedIds);
	}, [open, selectedIds]);

	async function handleSave() {
		try {
			await saveFundraiserParticipants(fundraiserId, selectedIds);
			setOpen(false);
			router.refresh();
		} catch (error) {
			console.error("Error saving fundraiser participants:", error);
		}
	}

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger
				render={
					<Button>
						<Plus />
						Select Participants
					</Button>
				}
			/>

			<DialogContent>
				<DialogHeader>
					<DialogTitle>Select Participants</DialogTitle>
					<DialogDescription>
						Select the participants for this fundraiser.
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-4 py-4">
					{availableRosters.map((team) => (
						<div key={team.id} className="flex items-center space-x-2">
							<p>Team: {team.name}</p>
							{team.players.map((player) => (
								<div key={player.id} className="flex items-center space-x-2">
									<input
										type="checkbox"
										id={player.id}
										checked={selectedIds.includes(player.id)}
										onChange={() => {
											if (selectedIds.includes(player.id)) {
												setSelectedIds(
													selectedIds.filter((id) => id !== player.id),
												);
											} else {
												setSelectedIds([...selectedIds, player.id]);
											}
										}}
									/>

									<label htmlFor={player.id}>
										{player.firstName} {player.lastName}
									</label>
								</div>
							))}
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

					<Button type="button" onClick={handleSave}>
						Save Participants
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
