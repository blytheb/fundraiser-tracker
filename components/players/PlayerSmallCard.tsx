import React from 'react';
import Image from "next/image";
import {Badge} from "@/components/ui/badge"

import type {Player} from "@/types/player"

type PlayerSmallCardProps = {
    player: Player
}

export default function PlayerSmallCard({player}: PlayerSmallCardProps) {
  return (
		<div className="mb-6 flex items-center gap-4 border">
			<div className="relative size-20 shrink-0 overflow-hidden rounded-lg">
				<Image
					src={player.imageUrl}
					alt={`${player.name} Icon`}
					fill
					className="object-cover"
				/>
			</div>

			<div>
				<div className="flex items-center gap-3">
					<h1 className="text-2xl font-bold">{player.firstName}</h1>
					<p className="text-muted-foreground">{player.lastName}</p>
				</div>
				<Badge variant="secondary">{player.status}</Badge>
			</div>
		</div>
	);
}
