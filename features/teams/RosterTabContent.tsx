import AddPlayerToTeamDialog from "@/components/forms/teams/AddPlayerToTeamDialog";
import PlayerListItem from "@/components/reusable/PlayerListItem";
import { ItemGroup } from "@/components/ui/item";
import type { Player } from "@prisma/client";

type TabProps = {
	teamId: string;
	players: Player[];
	availablePlayers: Player[];
};

export default function RosterTabContent({
	teamId,
	players,
	availablePlayers,
}: TabProps) {
	return (
		<section className="space-y-4">
			<div className="flex items-center justify-between gap-3">
				<div className="min-w-0">
					<h2 className="font-semibold">Roster</h2>
					<p className="text-sm text-muted-foreground">
						{players.length} {players.length === 1 ? "player" : "players"}
					</p>
				</div>

				<AddPlayerToTeamDialog
					teamId={teamId}
					availablePlayers={availablePlayers}
				/>
			</div>

			{players.length === 0 ? (
				<div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
					No players on this team yet.
				</div>
			) : (
				<ItemGroup>
					{players.map((player) => (
						<PlayerListItem key={player.id} player={player} />
					))}
				</ItemGroup>
			)}
		</section>
	);
}
