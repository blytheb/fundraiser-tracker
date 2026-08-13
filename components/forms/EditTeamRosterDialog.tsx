"use client";

import React from "react";
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

type EditTeamRosterProps = {
	players: Player[];
};

export default function EditTeamRosterDialog({ players }: EditTeamRosterProps) {
	const [open, setOpen] = useState(false);
	const [roster, setRoster] = useState(players);

	function removePlayer(playerId: string) {
		setRoster((currentRoster) =>
			currentRoster.filter((player) => player.id !== playerId),
		);
	}

	function handleSave() {
		console.log("Updated roster:", roster);
		setOpen(false);
	}

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger>Edit Roster</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Edit Team Roster</DialogTitle>
				</DialogHeader>
				<div className="space-y-4 py-4">
					{roster.map((player) => (
						<div
							key={player.id}
							className="flex items-center justify-between rounded-md border p-3">
							<div>
								{player.firstName} {player.lastName}
							</div>

							<Button
								variant="destructive"
								size="sm"
								onClick={() => removePlayer(player.id)}>
								Remove
							</Button>
						</div>
					))}
				</div>
				<DialogFooter>
					<Button variant="outline" onClick={() => setOpen(false)}>
						Cancel
					</Button>
					<Button type="button" onClick={handleSave}>
						Save
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
