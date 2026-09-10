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
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

import { saveFundraiserParticipants } from "@/features/fundraisers/actions/fundraiserParticipants";

import type { Player } from "@prisma/client";

type DialogProps = {
	fundraiserId: string;
	selectedPlayers: Player[];
	eligiblePlayers: Player[];
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
			await saveFundraiserParticipants(fundraiserId, selectedPlayerIds);
			router.refresh();
			setOpen(false);
		} catch (error) {
			console.error("Failed to add participant to fundraiser", error);
		}
	}

	function handleToggle(playerId: string, checked: boolean) {
		setSelectedPlayerIds((prev) =>
			checked ? [...prev, playerId] : prev.filter((id) => id !== playerId),
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
					<DialogTitle>Manage Participants</DialogTitle>
				</DialogHeader>
				{eligiblePlayers.map((player) => (
					<div key={player.id} className="flex items-center gap-3">
						<Checkbox
							id={player.id}
							checked={selectedPlayerIds.includes(player.id)}
							onCheckedChange={(checked) =>
								handleToggle(player.id, checked === true)
							}
						/>
						<Label htmlFor={player.id}>
							{player.firstName} {player.lastName}
						</Label>
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
