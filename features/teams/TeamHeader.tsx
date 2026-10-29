import type { Team } from "@prisma/client";

import TeamActions from "@/features/teams/TeamActions";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

type TeamHeaderProps = {
	team: Team;
	playerCount: number;
};

export default function TeamHeader({ team, playerCount }: TeamHeaderProps) {
	const isActive = team.status === "IN_SEASON";

	return (
		<Card>
			<CardContent className="flex items-center justify-between gap-4 p-4 sm:p-5">
				<div className="min-w-0 space-y-2">
					<h1 className="truncate text-2xl font-bold tracking-tight sm:text-3xl">
						{team.name}
					</h1>

					<div className="flex flex-wrap items-center gap-2">
						<Badge variant={isActive ? "default" : "secondary"}>
							{isActive ? "Active" : "Inactive"}
						</Badge>

						<span className="text-sm text-muted-foreground">
							{playerCount} {playerCount === 1 ? "player" : "players"}
						</span>
					</div>
				</div>

				<div className="shrink-0">
					<TeamActions team={team} />
				</div>
			</CardContent>
		</Card>
	);
}
