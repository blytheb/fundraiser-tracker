"use client";

import { useState } from "react";
import AddPlayerDialog from "@/components/forms/AddPlayerDialog";
import PlayerTable from "@/components/players/PlayerTable";
import { getAllPlayers, getPlayersWithTeams } from "@/lib/data/players";

export default function AllPlayersPage() {
	const [players, setPlayers] = useState(getPlayersWithTeams());

	function handleAddPlayer(newPlayer: Player) {
		setPlayers((currentPlayers) => [...currentPlayers, newPlayer]);
	}

	function handleEditPlayer(updatedPlayer: Player) {
		setPlayers((currentPlayers) =>
			currentPlayers.map((player) =>
				player.id === updatedPlayer.id ? updatedPlayer : player,
			),
		);
	}

	function handleDeletePlayer(deletePlayer: Player) {
		setPlayers((currentPlayers) =>
			currentPlayers.filter((player) => player.id !== deletePlayer.id),
		);
	}
	return (
		<div className="p-6">
			<div className="mb-6 flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-bold">Players</h1>
					<p className="text-muted-foreground">All Menehune players</p>
				</div>
				<AddPlayerDialog onAddPlayer={handleAddPlayer} />
			</div>
			<PlayerTable
				players={players}
				onEditPlayer={handleEditPlayer}
				onDeletePlayer={handleDeletePlayer}
			/>
		</div>
	);
}
