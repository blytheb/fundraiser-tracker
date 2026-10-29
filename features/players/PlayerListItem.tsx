import Link from "next/link";
import type { ReactNode } from "react";
import { ChevronRight } from "lucide-react";
import { Item, ItemContent, ItemMedia, ItemTitle } from "@/components/ui/item";
import type { Player } from "@prisma/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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
					<Avatar className="size-10">
						<AvatarImage
							src={
								player.imageUrl ?? `https://robohash.org/${player.id}?set=set2`
							}
							alt={`${player.firstName} ${player.lastName}`}
						/>
						<AvatarFallback>
							{player.firstName[0].toUpperCase()}
							{player.lastName[0].toUpperCase()}
						</AvatarFallback>
					</Avatar>
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
