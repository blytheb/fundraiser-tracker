import React from "react";
import ListItemWithAvatar from "@/components/ui-reusable/ListItemWithAvatar";

import { ItemGroup } from "@/components/ui/item";

import type { Player } from "@/prisma/client";

type ListProps = {
	players: Player[];
};

export default function PlayerList({ players }: ListProps) {
	return (
		<div className="space-y-2">
			{players.length === 0 ? (
				<div className="flex flex-col w-full items-center gap-3 rounded-lg border p-3">
					No Players Found
				</div>
			) : (
				<div className="space-y-4">
					<ItemGroup>
						{players.map((player) => (
							<ListItemWithAvatar key={player.id} player={player} />
						))}
					</ItemGroup>
				</div>
			)}
		</div>
	);
}
