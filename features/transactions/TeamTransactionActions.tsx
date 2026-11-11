"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { TeamTransactionStatus } from "@prisma/client";

import { Button, buttonVariants } from "@/components/ui/button";
import ConfirmDeleteDialog from "@/components/dialogs/ConfirmDeleteDialog";
import type { ActionResult } from "@/lib/action-result";
import {
	completeTeamTransaction,
	deleteTeamTransaction,
	publishTeamTransaction,
	reopenTeamTransaction,
	unpublishTeamTransaction,
} from "@/features/transactions/actions/team-transaction-status";

type Props = {
	id: string;
	status: TeamTransactionStatus;
	isBalanced: boolean;
	hasHistory: boolean;
};

// The next step is a visible button, not hidden in a menu.
// Reopen and delete ask for confirmation first.
export default function TeamTransactionActions({ id, status, isBalanced, hasHistory }: Props) {
	const router = useRouter();
	const [pending, setPending] = useState(false);
	const [confirm, setConfirm] = useState<"reopen" | "delete" | null>(null);
	const [confirmError, setConfirmError] = useState("");

	async function run(
		action: (id: string) => Promise<ActionResult<unknown>>,
		messages: { loading: string; success: string },
	) {
		setPending(true);
		const toastId = toast.loading(messages.loading);
		const result = await action(id);
		setPending(false);

		if (!result.ok) {
			toast.error(result.error, { id: toastId });
			return result;
		}

		toast.success(messages.success, { id: toastId });
		router.refresh();
		return result;
	}

	async function handleConfirm() {
		setConfirmError("");
		if (confirm === "reopen") {
			const result = await run(reopenTeamTransaction, {
				loading: "Reopening...",
				success: "Reopened as a draft",
			});
			if (result.ok) setConfirm(null);
			else setConfirmError(result.error);
		} else if (confirm === "delete") {
			const result = await run(deleteTeamTransaction, {
				loading: "Deleting...",
				success: "Team transaction deleted",
			});
			if (result.ok) router.push("/admin/transactions");
			else setConfirmError(result.error);
		}
	}

	return (
		<>
			<div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:justify-end">
				{status === "DRAFT" && (
					<>
						<Link
							href={`/admin/transactions/team/${id}/edit`}
							className={buttonVariants({ variant: "outline" })}>
							Edit
						</Link>
						<Button
							onClick={() =>
								run(completeTeamTransaction, {
									loading: "Completing...",
									success: "Completed",
								})
							}
							disabled={pending || !isBalanced}
							title={isBalanced ? undefined : "Shares must add up to the total"}>
							Complete
						</Button>
						{!hasHistory && (
							<Button
								variant="ghost"
								className="col-span-2 text-destructive sm:col-span-1"
								onClick={() => setConfirm("delete")}
								disabled={pending}>
								Delete draft
							</Button>
						)}
					</>
				)}

				{status === "COMPLETED" && (
					<>
						<Button variant="outline" onClick={() => setConfirm("reopen")} disabled={pending}>
							Reopen
						</Button>
						<Button
							onClick={() =>
								run(publishTeamTransaction, {
									loading: "Publishing...",
									success: "Published to parents",
								})
							}
							disabled={pending}>
							Publish to parents
						</Button>
					</>
				)}

				{status === "PUBLISHED" && (
					<>
						<Button variant="outline" onClick={() => setConfirm("reopen")} disabled={pending}>
							Reopen
						</Button>
						<Button
							variant="outline"
							onClick={() =>
								run(unpublishTeamTransaction, {
									loading: "Unpublishing...",
									success: "Hidden from parents",
								})
							}
							disabled={pending}>
							Unpublish
						</Button>
					</>
				)}
			</div>

			<ConfirmDeleteDialog
				open={confirm !== null}
				onOpenChange={(open) => {
					if (!open) {
						setConfirm(null);
						setConfirmError("");
					}
				}}
				title={confirm === "reopen" ? "Reopen as a draft?" : "Delete this draft?"}
				description={
					confirm === "reopen"
						? "Each player's share is removed from their balance (kept in history as void) so you can edit it. You'll need to complete and publish it again."
						: "This can't be undone."
				}
				confirmLabel={confirm === "reopen" ? "Reopen" : "Delete draft"}
				onConfirm={handleConfirm}
				error={confirmError}
				isPending={pending}
			/>
		</>
	);
}
