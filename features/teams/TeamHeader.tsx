import type { Team } from "@prisma/client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

type TeamHeaderProps = {
	team: Team;
	playerCount: number;
};

export default function TeamHeader({ team, playerCount }: TeamHeaderProps) {
	return (
		<Card className="mb-4">
			<CardContent className="p-5">
				<div className="flex items-start justify-between gap-4">
					<div className="min-w-0">
						<p className="text-2xl font-bold tracking-tight">{team.name}</p>

						<div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
							<span>2026 Season</span>

							<span>•</span>

							<span>Varsity</span>
							<span>•</span>

							<span>Active</span>
						</div>
					</div>

					<Badge variant="secondary">{playerCount} Players</Badge>
				</div>
			</CardContent>
		</Card>
	);
}
