"use client";

import { useState } from "react";
import { TeamGrid } from "@/components/teams/TeamGrid";
import { getAllTeams } from "@/lib/data/teams";

export default function AllTeamsPage() {
	const [teams, setTeams] = useState(getAllTeams());

	function handleAddTeam(newTeam: Team) {
		setTeams((currentTeams) => [...currentTeams, newTeam]);
	}

	function handleEditTeam(updatedTeam: Team) {
		setTeams((currentTeams) =>
			currentTeams.map((team) =>
				team.id === updatedTeam.id ? updatedTeam : team,
			),
		);
	}
	return (
		<div className="p-6">
			<div className="mb-6 flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-bold">Teams</h1>
					<p className="text-muted-foreground">All Menehune teams</p>
				</div>
			</div>
			<TeamGrid
				teams={teams}
				onAddTeam={handleAddTeam}
				onEditTeam={handleEditTeam}
			/>
		</div>
	);
}
