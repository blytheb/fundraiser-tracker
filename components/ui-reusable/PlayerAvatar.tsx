import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { Player } from "@prisma/client";

type AvatarProps = {
	player: Player;
};

export default function PlayerAvatar({ player }: AvatarProps) {
	return (
		<Avatar className="size-10">
			<AvatarImage
				src={player.imageUrl ?? `https://robohash.org/${player.id}?set=set2`}
				alt={`${player.firstName} ${player.lastName}`}
			/>
			<AvatarFallback>
				{player.firstName[0].toUpperCase()}
				{player.lastName[0].toUpperCase()}
			</AvatarFallback>
		</Avatar>
	);
}
