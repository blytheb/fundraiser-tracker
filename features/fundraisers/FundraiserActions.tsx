"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
import { changeStatus } from "@/features/fundraisers/actions/fundraisers";
import EditFundraiserDialog from "@/components/forms/fundraisers/EditFundraiserDialog";
import DeleteFundraiserDialog from "@/components/forms/fundraisers/DeleteFundraiserDialog";

import type { Fundraiser } from "@prisma/client";

type FundraiserActionsProps = {
	fundraiser: Fundraiser;
};

export default function FundraiserActions({
	fundraiser,
}: FundraiserActionsProps) {
	const [editOpen, setEditOpen] = useState(false);
	const [deleteOpen, setDeleteOpen] = useState(false);
	const router = useRouter();

	async function handleComplete() {
		try {
			await changeCompletedStatus(fundraiser.id);
			router.refresh();
		} catch (error) {
			console.error(error);
		}
	}
	return (
		<>
			{/* Smaller Screens Collapsed Actions */}
			<div>
				<DropdownMenu>
					<DropdownMenuTrigger>
						<MoreVertical />
					</DropdownMenuTrigger>

					<DropdownMenuContent align="end">
						<DropdownMenuItem onClick={handleComplete}>
							Toggle Edit Mode
						</DropdownMenuItem>
						<DropdownMenuItem
							onClick={(e) => {
								e.preventDefault();
								console.log("Edit Clicked");
								setEditOpen(true);
							}}>
							Edit Fundraiser
						</DropdownMenuItem>
						<DropdownMenuItem
							onClick={(e) => {
								e.preventDefault();
								console.log("delete clicked");
								setDeleteOpen(true);
							}}
							className="text-destructive">
							Delete Fundraiser
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</div>

			{/* Large Screen 3 action buttons
			<div className="hidden lg:flex items-center gap-1">
				{/* <div className="flex items-center gap-1"> 
				<Button variant="ghost" size="icon">
					<Link href={`/fundraisers/${fundraiser.id}`}>
						<Eye />
					</Link>
				</Button>

				<Button variant="ghost" size="icon" onClick={() => setEditOpen(true)}>
					<Pencil />
				</Button>

				<Button variant="ghost" size="icon" onClick={() => setDeleteOpen(true)}>
					<Trash2 />
				</Button>
			</div> */}

			<EditFundraiserDialog
				fundraiser={fundraiser}
				open={editOpen}
				onOpenChange={setEditOpen}
			/>

			<DeleteFundraiserDialog
				fundraiser={fundraiser}
				open={deleteOpen}
				onOpenChange={setDeleteOpen}
			/>
		</>
	);
}
