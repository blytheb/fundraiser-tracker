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
	actions?: React.ReactNode;
};

export default function ListItemWithAvatar({ player, actions }: ItemProps) {
	return (
		<Item
			// className="flex w-full items-center justify-center gap-6 py-2"
			variant="outline"
			size="sm">
			{/* <Link href={`/players/${player.id}`}> */}
			<div className="flex w-full items-center gap-6 py-2">
				<ItemMedia>
					<Avatar className="size-10">
						<AvatarImage src={player.imageUrl} />
						<AvatarFallback>AA</AvatarFallback>
					</Avatar>
				</ItemMedia>
				<ItemContent>
					{" "}
					<ItemTitle>
						{player.firstName} {player.lastName}
					</ItemTitle>
				</ItemContent>
				<ItemActions>{actions}</ItemActions>
			</div>
			{/* </Link> */}
		</Item>
	);
}
