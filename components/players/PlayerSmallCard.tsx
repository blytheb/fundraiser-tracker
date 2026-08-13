import React from "react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";

import type { Player } from "@/types/player";

type PlayerSmallCardProps = {
	player: Player;
};

export default function PlayerSmallCard({ player }: PlayerSmallCardProps) {
	return (
		<div className="min-h-[100px] min-w-[200px] flex items-center justify-center gap-3 border">
			<div className="relative size-20 shrink-0 overflow-hidden rounded-lg">
				<Image
					src={player.imageUrl}
					alt={`${player.name} Icon`}
					fill
					className="object-cover"
				/>
			</div>

			<div className="flex flex-col gap-0.5">
				<div>
					<p className="text-smtext-muted-foreground">{player.firstName}</p>
					<p className="text-2xl font-bold">{player.lastName}</p>
				</div>
				<Badge variant="secondary">{player.status}</Badge>
			</div>
		</div>
	);
}
