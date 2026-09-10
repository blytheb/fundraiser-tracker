import React from "react";
import {
	Item,
	ItemContent,
	ItemDescription,
	ItemMedia,
	ItemTitle,
} from "@/components/ui/item";
import Image from "next/image";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

import type { Team } from "@prisma/client";

type ItemProps = {
	team: Team;
};

export default function ListItemWithImage({ team }: ItemProps) {
	return (
		<Item variant="outline" className="overflow-hidden p-0">
			<Link
				href={`/teams/${team.id}`}
				className="flex min-h-32 w-full justify-between items-center gap-6 px-4">
				{/* Team Image */}
				<ItemMedia className="w-2/5 shrink-0">
					{team.imageUrl ? (
						<Image
							src={team.imageUrl}
							alt={team.name}
							width={300}
							height={300}
							className="h-full w-full object-cover"
						/>
					) : (
						<div className="h-full w-full bg-muted" />
					)}
					{/* src={team.imageUrl ?? "/placeholder.png"} */}
				</ItemMedia>

				{/* Team Information */}
				<ItemContent className="justify-center p-4">
					<ItemTitle className="text-base font-semibold">{team.name}</ItemTitle>

					<ItemDescription className="mt-1">{team.status}</ItemDescription>
				</ItemContent>
				<ChevronRight />
			</Link>
		</Item>
	);
}
