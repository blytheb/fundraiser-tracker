"use client";

import { useState, useEffect } from "react";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type TeamRosterProps = {
	teamId: string;
	players: Player[];
	allPlayers: Player[];
	onUpdateRoster: (players: Player[]) => void;
};

export default function TeamRosterDialog({
	teamId,
	players,
	allPlayers,
	onUpdateRoster,
}: TeamRosterProps) {
	const [open, setOpen] = useState(false);
	const [search, setSearch] = useState("");

	// Temporary roster used while editing
	const [roster, setRoster] = useState<Player[]>(players);
	const availablePlayers = allPlayers.filter((player) => {
		const alreadyOnRoster = roster.some(
			(rosterPlayer) => rosterPlayer.id === player.id,
		);
		const searchText = `${player.firstName} ${player.lastName}`.toLowerCase();
		const matchesSearch = searchText.includes(search.toLowerCase());

		return !alreadyOnRoster && matchesSearch;
	});

	// Reset the temporary roster whenever the dialog opens
	// useEffect(() => {
	// 	if (open) {
	// 		setRoster(players);
	// 	}
	// }, [open, players]);

	function addPlayer(player: Player) {
		setRoster((currentRoster) => [...currentRoster, player]);

		setSearch("");
	}

	function removePlayer(playerId: string) {
		setRoster((currentRoster) =>
			currentRoster.filter((player) => player.id !== playerId),
		);
	}

	function handleSave() {
		onUpdateRoster(roster);
		setOpen(false);
	}

	function handleCancel() {
		setRoster(players);
		setOpen(false);
	}

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger>Edit Roster</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Edit Team Roster</DialogTitle>
				</DialogHeader>
				<div className="space-y-2">
					<Input
						placeholder="Search players..."
						value={search}
						onChange={(e) => setSearch(e.target.value)}
					/>
					<div className="max-h-48 overflow-y-auto rounded-md border">
						{search.length === 0 ? (
							<div className="p-3 text-sm text-muted-foreground">
								Search for a player to add
							</div>
						) : availablePlayers.length === 0 ? (
							<div className="p-3 text-sm text-muted-foreground">
								No players found
							</div>
						) : (
							availablePlayers.map((player) => (
								<div
									key={player.id}
									className="flex items-center justify-between border-b p-3 last:border-b-0">
									<div>
										{player.firstName} {player.lastName}
									</div>

									<Button
										type="button"
										size="sm"
										onClick={() => addPlayer(player)}>
										Add
									</Button>
								</div>
							))
						)}
					</div>
				</div>
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
					<Button variant="outline" onClick={handleCancel}>
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
