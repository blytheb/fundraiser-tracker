"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { MoreVertical } from "lucide-react";

import { publishFundraiser } from "@/features/fundraisers/actions/publish-fundraiser";
import { reopenFundraiser } from "@/features/fundraisers/actions/reopen-fundraiser";
import { completeFundraiser } from "@/features/fundraisers/actions/complete-fundraiser";
import EditFundraiserDialog from "@/components/forms/fundraisers/EditFundraiserDialog";
import DeleteFundraiserDialog from "@/components/dialogs/DeleteFundraiserDialog";

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
			await completeFundraiser(fundraiser.id);
			router.refresh();
		} catch (error) {
			console.error(error);
		}
	}

	async function handlePublish() {
		try {
			await publishFundraiser(fundraiser.id);
			router.refresh();
		} catch (error) {
			console.error(error);
		}
	}

	async function handleReopen() {
		try {
			await reopenFundraiser(fundraiser.id);
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
						{!fundraiser.isCompleted ? (
							<DropdownMenuItem onClick={handleComplete}>
								Complete Fundraiser
							</DropdownMenuItem>
						) : (
							<>
								{!fundraiser.isPublished && (
									<DropdownMenuItem onClick={handlePublish}>
										Publish Fundraiser
									</DropdownMenuItem>
								)}

								<DropdownMenuItem onClick={handleReopen}>
									Reopen to Draft
								</DropdownMenuItem>
							</>
						)}

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
