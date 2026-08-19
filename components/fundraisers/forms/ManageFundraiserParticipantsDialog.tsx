"use client";

import React from "react";

import { useRouter } from "next/navigation";

import { Plus } from "lucide-react";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { saveFundraiserParticipants } from "@/lib/actions/fundraiserParticipants";

import type { Player } from "@/types/player";

type DialogProps = {
	fundraiserId: string;
	selectedPlayers: Player[];
	eligiblePlayers: PLayer[];
};

export default function ManageFundraiserParticipantsDialog({
	fundraiserId,
	selectedPlayers,
	eligiblePlayers,
}: DialogProps) {
	const router = useRouter();
	const [open, setOpen] = useState(false);
	const [selectedPlayerIds, setSelectedPlayerIds] = useState<string[]>(
		selectedPlayers.map((player) => player.id),
	);
	async function handleSave() {
		try {
			await saveFundraiserParticipants(fundraiserId, selectedTeamIds);
			router.refresh();
			setOpen(false);
		} catch (error) {
			console.error("Failed to add participant to fundraiser", error);
		}
	}

	function handleToggle(playerId: string) {
		setSelectedPlayerIds((current) =>
			current.includes(playerId)
				? current.filter((id) => id !== playerId)
				: [...current, playerId],
		);
	}

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger
				render={
					<Button>
						<Plus />
						Edit Participants
					</Button>
				}></DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Team Selection</DialogTitle>
				</DialogHeader>
				{eligiblePlayers.map((team) => (
					<div key={team.id}>
						<Input
							type="checkbox"
							checked={selectedPlayerIds.includes(player.id)}
							onChange={() => handleToggle(player.id)}
						/>
						{player.firstName} {player.lastName}
					</div>
				))}

				<DialogFooter>
					<Button type="button" onClick={handleSave}>
						Save Player Selection
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
