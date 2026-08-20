import { Badge } from "@/components/ui/badge";
import TeamActions from "@/components/teams/TeamActions";
import type { Team } from "@/types/team";

type TeamHeaderProps = {
	team: Team;
};

export default function TeamHeader({ team }: TeamHeaderProps) {
	return (
		<header className="space-y-4">
			{/* Top row */}
			<div className="flex items-start justify-between gap-4">
				<div className="min-w-0">
					<p className="text-sm text-muted-foreground">Team</p>

					<h1 className="truncate text-2xl font-bold tracking-tight sm:text-3xl">
						{team.name}
					</h1>

					<p className="mt-1 text-sm text-muted-foreground sm:text-base">
						Menehune Volleyball
					</p>
				</div>

				<div className="shrink-0">
					<TeamActions team={team} />
				</div>
			</div>

			{/* Status */}
			<Badge variant="secondary" className="w-fit">
				{team.status}
			</Badge>
		</header>
	);
}
