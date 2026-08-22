import React from "react";
import {
	Item,
	ItemActions,
	ItemContent,
	ItemDescription,
	ItemMedia,
	ItemTitle,
} from "@/components/ui/item";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import PlayerActions from "@/components/players/PlayerActions";

import type { Player } from "@/types/player";

type ItemProps = {
	player: Player;
};

export default function ListItemWithAvatar({ player }: ItemProps) {
	return (
		<Item
			className="flex w-full items-center justify-center gap-6 py-2"
			variant="outline"
			size="sm">
			<ItemMedia>
				<Avatar className="size-10">
					<AvatarImage src={player.imageUrl} />
					<AvatarFallback>AA</AvatarFallback>
				</Avatar>
			</ItemMedia>
			<ItemContent>
				<Link href={`/players/${player.id}`}>
					<ItemTitle>
						{player.firstName} {player.lastName}
					</ItemTitle>
				</Link>
			</ItemContent>
			<ItemActions>
				<PlayerActions player={player} />
			</ItemActions>
		</Item>
	);
}
