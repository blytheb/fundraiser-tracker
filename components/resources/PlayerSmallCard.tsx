import React from "react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";

import type { Player } from "@prisma/client";

type PlayerSmallCardProps = {
	player: Player;
};

export default function PlayerSmallCard({ player }: PlayerSmallCardProps) {
	return (
		<div className="min-h-[100px] min-w-[200px] flex items-center justify-center gap-3 border">
			<div className="relative size-20 shrink-0 overflow-hidden rounded-lg">
				<Image
					src={player.imageUrl ?? "/placeholder.png"}
					alt={`${player.firstName} ${player.lastName} Icon`}
					fill
					className="object-cover"
				/>
			</div>

			<div className="flex flex-col gap-0.5">
				<div>{`${player.firstName} ${player.lastName}`}</div>
				<Badge variant="secondary">{player.status}</Badge>
			</div>
		</div>
	);
}
