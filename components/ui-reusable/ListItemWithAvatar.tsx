import React from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import PlayerAvatar from "@/components/ui-reusable/PlayerAvatar";

import { Item, ItemContent, ItemMedia, ItemTitle } from "@/components/ui/item";

import type { Player } from "@prisma/client";

type ListItemWithAvatarProps = {
	player: Player;
	action?: React.ReactNode;
};

export default function ListItemWithAvatar({
	player,
	action,
}: ListItemWithAvatarProps) {
	const content = (
		<>
			<ItemMedia>
				<PlayerAvatar player={player} />
			</ItemMedia>

			<ItemContent>
				<ItemTitle>
					{player.firstName} {player.lastName}
				</ItemTitle>
			</ItemContent>

			{!action && <ChevronRight className="shrink-0" />}
		</>
	);

	// No action → entire card is clickable
	if (!action) {
		return (
			<Link href={`/players/${player.id}`}>
				<Item variant="outline" size="sm">
					{content}
				</Item>
			</Link>
		);
	}

	// Has action → only the content is clickable
	return (
		<Item variant="outline" size="sm">
			<Link
				href={`/players/${player.id}`}
				className="flex min-w-0 flex-1 items-center gap-4">
				{content}
			</Link>

			<div className="shrink-0">{action}</div>
		</Item>
	);
}
