import Image from "next/image";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

import AddTeamDialog from "@/components/forms/teams/AddTeamDialog";
import {
	Item,
	ItemContent,
	ItemDescription,
	ItemMedia,
	ItemTitle,
	ItemGroup,
} from "@/components/ui/item";

import type { Team } from "@prisma/client";

type TeamListProps = {
	teams: Team[];
};

export default function TeamList({ teams }: TeamListProps) {
	return (
		<div className="space-y-2">
			{teams.length === 0 ? (
				<div className="flex w-full flex-col items-center gap-3 rounded-lg border p-3 text-sm text-muted-foreground">
					No Seasons Found
				</div>
			) : (
				<ItemGroup>
					{teams.map((team) => (
						<Item
							key={team.id}
							variant="outline"
							className="overflow-hidden p-0">
							<Link
								href={`/teams/${team.id}`}
								className="flex min-h-24 w-full items-center gap-3 px-3 py-2 transition-colors hover:bg-muted/50">
								<ItemMedia className="size-14 shrink-0 overflow-hidden rounded-md">
									<Image
										src={team.imageUrl ?? "/MenehuneBasketballLogo.png"}
										alt={team.name}
										width={56}
										height={56}
										className="size-full object-cover"
									/>
								</ItemMedia>

								<ItemContent className="min-w-0 flex-1 justify-center">
									<ItemTitle className="truncate text-sm font-semibold">
										{team.name}
									</ItemTitle>
									<ItemDescription className="mt-1 text-xs">
										{team.status}
									</ItemDescription>
								</ItemContent>

								<ChevronRight className="size-4 shrink-0 text-muted-foreground" />
							</Link>
						</Item>
					))}
				</ItemGroup>
			)}
		</div>
	);
}
