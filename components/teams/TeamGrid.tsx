import React from "react";
import TeamCard from "@/components/teams/TeamCard";
import AddTeamDialog from "@/components/forms/AddTeamDialog";

import type { Team } from "@/types/Team";

type TeamGridProps = {
	teams: Team[];
	onAddTeam: (team: Team) => void;
	onEditTeam: (team: Team) => void;
};

export function TeamGrid({ teams, onAddTeam, onEditTeam }: TeamGridProps) {
	return (
		<>
			{teams.length === 0 ? (
				<div className="rounded-lg border">
					<div className="p-6 text-center text-muted-foreground">
						No seasons have been created yet.
					</div>
				</div>
			) : (
				<div className="grid grid-cols-1 gap-6 items-stretch sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 ">
					{teams.map((team) => (
						<TeamCard key={team.id} team={team} onEditTeam={onEditTeam} />
					))}
					<AddTeamDialog onAddTeam={onAddTeam} />
				</div>
			)}
		</>
	);
}
