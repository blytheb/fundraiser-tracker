"use client";

import { MoreVertical } from "lucide-react";
import { useState } from "react";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";

import EditPlayerDialog from "@/components/forms/EditPlayerDialog";
import DeletePlayerDialog from "@/components/forms/DeletePlayerDialog";

import type { Fundraiser } from "@/types/fundraiser";

type FundraiserActionsProps = {
	fundraiser: Fundraiser;
	onEditPlayer: (player: PLayer) => void;
	onDeletePlayer: (playerId: string) => void;
};

export default function PlayerActions({
	fundraiser,
	// onEditFundraiser,
	// onDeleteFundraiser,
}: FundraiserActionsProps) {
	const [editOpen, setEditOpen] = useState(false);
	const [deleteOpen, setDeleteOpen] = useState(false);

	return (
		<>
			{/* Smaller Screens Collapsed Actions */}
			<div className="lg:hidden">
				<DropdownMenu>
					<DropdownMenuTrigger>
						<MoreVertical />
					</DropdownMenuTrigger>

					<DropdownMenuContent align="end">
						<DropdownMenuItem
							onClick={(e) => {
								e.preventDefault();
								console.log("Edit Clicked");
								setEditOpen(true);
							}}>
							Edit Team
						</DropdownMenuItem>
						<DropdownMenuItem
							onClick={(e) => {
								e.preventDefault();
								console.log("delete clicked");
								setDeleteOpen(true);
							}}
							className="text-destructive">
							Delete Team
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</div>

			{/* Large Screen 3 action buttons */}
			{/* <div className="hidden lg:flex items-center gap-1"> */}
			<div className="flex items-center gap-1">
				<Button variant="ghost" size="icon">
					<Link href={`/players/${fundraiser.id}`}>
						<Eye />
					</Link>
				</Button>

				<Button variant="ghost" size="icon" onClick={() => setEditOpen(true)}>
					<Pencil />
				</Button>

				<Button variant="ghost" size="icon" onClick={() => setDeleteOpen(true)}>
					<Trash2 />
				</Button>
			</div>

			{/* <EditPlayerDialog
				fundraiser={fundraiser}
				open={editOpen}
				onOpenChange={setEditOpen}
				onEditPlayer={onEditFundraiser}
			/>

			<DeletePlayerDialog
				fundraiser={fundraiser}
				open={deleteOpen}
				onOpenChange={setDeleteOpen}
				onDeletePlayer={onDeleteFundraiser}
			/> */}
		</>
	);
}
