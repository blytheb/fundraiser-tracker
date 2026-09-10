"use client";

import { useState } from "react";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { MoreVertical } from "lucide-react";

import Link from "next/link";

import RemovePlayerFromTeamDialog from "@/components/forms/teams/RemovePlayerFromTeamDialog";

import type { Player } from "@prisma/client";

type ActionsProps = {
	player: Player;
	teamId: string;
};

export default function TeamPlayerActions({ player, teamId }: ActionsProps) {
	const [removeOpen, setRemoveOpen] = useState(false);

	return (
		<>
			{/* Smaller Screens Collapsed Actions */}
			<div>
				<DropdownMenu>
					<DropdownMenuTrigger>
						<MoreVertical />
					</DropdownMenuTrigger>

					<DropdownMenuContent align="end">
						<DropdownMenuItem>
							<Link href={`/players/${player.id}`}>View Player</Link>
						</DropdownMenuItem>
						<DropdownMenuItem
							onClick={(e) => {
								e.preventDefault();
								console.log("delete clicked");
								setRemoveOpen(true);
							}}
							className="text-destructive">
							Remove
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</div>

			<RemovePlayerFromTeamDialog
				player={player}
				teamId={teamId}
				open={removeOpen}
				onOpenChange={setRemoveOpen}
			/>
		</>
	);
}
