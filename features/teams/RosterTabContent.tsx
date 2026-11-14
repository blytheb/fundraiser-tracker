import ManageRosterDialog from "@/components/forms/teams/ManageRosterDialog";
import PlayerListItem from "@/features/players/PlayerListItem";
import { ItemGroup } from "@/components/ui/item";
import type { Player } from "@prisma/client";

type TabProps = {
	teamId: string;
	teamName: string;
	players: Player[];
	availablePlayers: Player[];
};

const toPickerPlayer = (player: Player) => ({
	id: player.id,
	firstName: player.firstName,
	lastName: player.lastName,
	name: `${player.firstName} ${player.lastName}`,
	status: player.status,
});

export default function RosterTabContent({
	teamId,
	teamName,
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

				<ManageRosterDialog
					teamId={teamId}
					teamName={teamName}
					roster={players.map(toPickerPlayer)}
					available={availablePlayers.map(toPickerPlayer)}
				/>
			</div>

			{players.length === 0 ? (
				<div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
					No players on this team yet. Use Manage roster to add some.
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
