"use client";

import { TeamGrid } from "@/components/teams/TeamGrid";
import type { Team } from "@/types/team";

type LayoutProps = {
	teams: Team[];
};

export default function AllTeamsLayout({ teams }: LayoutProps) {
	return (
		<div className="p-6">
			<div className="mb-6 flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-bold">Teams</h1>
					<p className="text-muted-foreground">All Menehune teams</p>
				</div>
			</div>
			<TeamGrid teams={teams} />
		</div>
	);
}
