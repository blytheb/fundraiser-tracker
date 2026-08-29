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
import { ChevronRight } from "lucide-react";

import type { Player } from "@/types/player";

type ItemProps = {
	player: Player;
};

export default function ListItemWithAvatar({ player }: ItemProps) {
	return (
		<Item variant="outline" size="sm">
			<Link
				href={`players/${player.id}`}
				className="flex w-full items-center gap-6 py-2">
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
				<ChevronRight />
			</Link>
		</Item>
	);
}
