import React from "react";
import {
	Item,
	ItemActions,
	ItemContent,
	ItemDescription,
	ItemMedia,
	ItemTitle,
} from "@/components/ui/item";
import Image from "next/image";
import TeamActions from "@/components/teams/TeamActions";

import type { Team } from "@/types/Team";

type ItemProps = {
	team: Team;
};

export default function ListItemWithImage({ team }: ItemProps) {
	return (
		<Item variant="outline" className="overflow-hidden p-0">
			<div className="flex min-h-32 w-full">
				{/* Team Image */}
				<ItemMedia className="w-2/5 shrink-0">
					<Image
						src={team.imageUrl}
						alt={team.name}
						width={300}
						height={300}
						className="h-full w-full object-cover"
					/>
				</ItemMedia>

				{/* Team Information */}
				<ItemContent className="justify-center p-4">
					<ItemTitle className="text-base font-semibold">{team.name}</ItemTitle>

					<ItemDescription className="mt-1">{team.status}</ItemDescription>
				</ItemContent>
				<ItemActions>
					<TeamActions team={team} />
				</ItemActions>
			</div>
		</Item>
	);
}
