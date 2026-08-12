import React from "react";
import TeamCard from "@/components/teams/TeamCard";
import AddTeamCard from "@/components/teams/AddTeamCard";

import { mockTeams } from "@/lib/mock-data/teams";

export function TeamList() {
	return (
		<>
			<div className="p-6">
				<div className="mb-6 flex items-center justify-between">
					<div>
						<h1 className="text-2xl font-bold">Teams</h1>
						<p className="text-muted-foreground">All Menehune teams</p>
					</div>
				</div>

				<div className="rounded-lg border">
					<div className="p-6 text-center text-muted-foreground">
						No seasons have been created yet.
					</div>
				</div>

				<div className="grid grid-cols-1 gap-6 items-stretch sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 ">
					{mockTeams.map((team) => (
						<TeamCard key={team.id} team={team} />
					))}
					<AddTeamCard />
				</div>
			</div>
		</>
	);
}
