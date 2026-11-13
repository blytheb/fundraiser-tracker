"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { ActionResult } from "@/lib/action-result";
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

	const [isPending, setIsPending] = useState(false);

	async function runStatusChange(
		action: (id: string) => Promise<ActionResult<unknown>>,
		messages: { loading: string; success: string },
	) {
		setIsPending(true);
		const toastId = toast.loading(messages.loading);

		const result = await action(fundraiser.id);
		setIsPending(false);

		if (!result.ok) {
			toast.error(result.error, { id: toastId });
			return;
		}

		toast.success(messages.success, { id: toastId });
		router.refresh();
	}

	function handleComplete() {
		return runStatusChange(completeFundraiser, {
			loading: "Finalizing fundraiser...",
			success: "Finalized: counted in balances",
		});
	}

	function handlePublish() {
		return runStatusChange(publishFundraiser, {
			loading: "Sharing with parents...",
			success: "Shared with parents",
		});
	}

	function handleReopen() {
		return runStatusChange(reopenFundraiser, {
			loading: "Reopening fundraiser...",
			success: "Reopened as a draft",
		});
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
						{fundraiser.status === "DRAFT" ? (
							<DropdownMenuItem onClick={handleComplete} disabled={isPending}>
								Finalize
							</DropdownMenuItem>
						) : (
							<>
								{fundraiser.status === "COMPLETED" && (
									<DropdownMenuItem onClick={handlePublish} disabled={isPending}>
										Share with parents
									</DropdownMenuItem>
								)}

								<DropdownMenuItem onClick={handleReopen} disabled={isPending}>
									Reopen as draft
								</DropdownMenuItem>
							</>
						)}

						<DropdownMenuItem
							onClick={(e) => {
								e.preventDefault();
								setEditOpen(true);
							}}>
							Edit Fundraiser
						</DropdownMenuItem>
						<DropdownMenuItem
							onClick={(e) => {
								e.preventDefault();
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
