"use client";

import { useState } from "react";
import AddPlayerDialog from "@/components/forms/AddPlayerDialog";
import PlayerTable from "@/components/players/PlayerTable";
import { getAllPlayers, getPlayersWithTeams } from "@/lib/data/players";

export default function AllPlayersPage() {
	const [players, setPlayers] = useState(getPlayersWithTeams());

	// function handleAddTeam(newTeam: Team) {
	// 	setTeams((currentTeams) => [...currentTeams, newTeam]);
	// }

	// function handleEditTeam(updatedTeam: Team) {
	// 	setTeams((currentTeams) =>
	// 		currentTeams.map((team) =>
	// 			team.id === updatedTeam.id ? updatedTeam : team,
	// 		),
	// 	);
	// }

	// function handleDeleteTeam(deleteTeam: Team) {
	// 	setTeams((currentTeams) =>
	// 		currentTeams.filter((team) => team.id !== deleteTeam.id),
	// 	);
	// }
	return (
		<div className="p-6">
			<div className="mb-6 flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-bold">Teams</h1>
					<p className="text-muted-foreground">All Menehune teams</p>
				</div>
				<AddPlayerDialog />
			</div>
			<PlayerTable
				players={players}
				onAddTeam={handleAddTeam}
				// onEditTeam={handleEditTeam}
				// onDeleteTeam={handleDeleteTeam}
			/>
		</div>
	);
}
