import { Badge } from "@/components/ui/badge";
import TeamActions from "@/components/teams/TeamActions";
import type { Team } from "@/types/team";
import { Card, CardContent } from "@/components/ui/card";

type TeamHeaderProps = {
	team: Team;
};

export default function TeamHeader({ team }: TeamHeaderProps) {
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

					<Badge variant="secondary">14 Players</Badge>
				</div>
			</CardContent>
		</Card>
	);
}
