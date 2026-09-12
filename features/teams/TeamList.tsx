import React from "react";
import ListItemWithImage from "@/components/ui-reusable/ListItemWithImage";

import AddTeamDialog from "@/components/forms/teams/AddTeamDialog";

import { ItemGroup } from "@/components/ui/item";
import type { Team } from "@prisma/client";

type TeamListProps = {
	teams: Team[];
};

export default function TeamList({ teams }: TeamListProps) {
	return (
		<div>
			{teams.length === 0 ? (
				<div>
					<AddTeamDialog />
					<div className="rounded-lg border">
						<div className="p-6 text-center text-muted-foreground">
							No seasons have been created yet.
						</div>
					</div>
				</div>
			) : (
				<ItemGroup className="grid grid-cols-1 gap-4 items-stretch sm:grid-cols-2 lg:grid-cols-4">
					{teams.map((team) => (
						<ListItemWithImage key={team.id} team={team} />
					))}
					<AddTeamDialog />
				</ItemGroup>
			)}
		</div>
	);
}
