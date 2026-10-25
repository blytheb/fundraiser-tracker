import Link from "next/link";
import type { ReactNode } from "react";
import { ChevronRight } from "lucide-react";
import { Item, ItemContent, ItemMedia, ItemTitle } from "@/components/ui/item";
import PlayerAvatar from "@/components/reusable/PlayerAvatar";
import type { Player } from "@prisma/client";

type PlayerListItemProps = {
	player: Player;
};

export default function PlayerListItem({ player }: PlayerListItemProps) {
	return (
		<Item variant="outline" size="sm">
			<Link
				href={`/players/${player.id}`}
				className="flex min-w-0 flex-1 items-center gap-3">
				<ItemMedia>
					<PlayerAvatar player={player} />
				</ItemMedia>

				<ItemContent>
					<ItemTitle>
						{player.firstName} {player.lastName}
					</ItemTitle>
				</ItemContent>

				<ChevronRight className="size-4 shrink-0 text-muted-foreground" />
			</Link>
		</Item>
	);
}
