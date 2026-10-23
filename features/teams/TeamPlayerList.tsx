import PlayerListItem from "@/components/reusable/PlayerListItem";
import { ItemGroup } from "@/components/ui/item";
import type { Player } from "@prisma/client";

type ListProps = {
	players: Player[];
};

export default function TeamPlayerList({ players }: ListProps) {
	if (players.length === 0) {
		return (
			<div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
				No players on this team yet.
			</div>
		);
	}

	return (
		<ItemGroup>
			{players.map((player) => (
				<PlayerListItem key={player.id} player={player} />
			))}
		</ItemGroup>
	);
}
