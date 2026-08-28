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

import type { Player } from "@/types/player";

type ItemProps = {
	player: Player;
	actions?: React.ReactNode;
};

export default function ListItemWithAvatar({ player, actions }: ItemProps) {
	return (
		<Item variant="outline" size="sm">
			<div className="flex w-full items-center gap-6 py-2">
				<ItemMedia>
					<Avatar className="size-10">
						<AvatarImage src={player.imageUrl} />
						<AvatarFallback>AA</AvatarFallback>
					</Avatar>
				</ItemMedia>
				<ItemContent>
					<ItemTitle>
						{player.firstName} {player.lastName}
					</ItemTitle>
				</ItemContent>
				{actions && <ItemActions>{actions}</ItemActions>}
			</div>
		</Item>
	);
}
