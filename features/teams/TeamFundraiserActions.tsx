"use client";

import { useState } from "react";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

import { Eye, Pencil, Trash2 } from "lucide-react";
import { MoreVertical } from "lucide-react";

import Link from "next/link";

import RemoveFundraiserFromTeamDialog from "@/components/forms/teams/RemoveFundraiserFromTeamDialog";

import type { Fundraiser } from "@/types/fundraiser";

type ActionsProps = {
	fundraiser: Fundraiser;
	teamId: string;
};

export default function TeamFundraiserActions({
	fundraiser,
	teamId,
}: ActionsProps) {
	const [deleteOpen, setDeleteOpen] = useState(false);

	return (
		<>
			{/* Smaller Screens Collapsed Actions */}
			<div>
				<DropdownMenu>
					<DropdownMenuTrigger>
						<MoreVertical />
					</DropdownMenuTrigger>

					<DropdownMenuContent align="end">
						<DropdownMenuItem
							onClick={(e) => {
								e.preventDefault();
								console.log("delete clicked");
								setDeleteOpen(true);
							}}
							className="text-destructive">
							Remove
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</div>

			<RemoveFundraiserFromTeamDialog
				fundraiser={fundraiser}
				teamId={teamId}
				open={deleteOpen}
				onOpenChange={setDeleteOpen}
			/>
		</>
	);
}
