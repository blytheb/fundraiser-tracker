"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { TeamTransactionStatus } from "@prisma/client";

import { Button } from "@/components/ui/button";
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
	hasHistory: boolean; // has counted before, so delete keeps a hidden record
};

type Confirm = "edit" | "reopen" | "delete" | null;

// Draft / Final / Shared. The next step is the primary button; Edit and Delete
// are always visible. Anything that changes balances asks first.
export default function TeamTransactionActions({ id, status, isBalanced, hasHistory }: Props) {
	const router = useRouter();
	const [pending, setPending] = useState(false);
	const [confirm, setConfirm] = useState<Confirm>(null);
	const [confirmError, setConfirmError] = useState("");

	if (status === "VOIDED") {
		return null; // deleted: kept for history, nothing to do
	}

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
		} else {
			toast.success(messages.success, { id: toastId });
		}
		return result;
	}

	function handleEdit() {
		if (status === "DRAFT") {
			router.push(`/admin/transactions/team/${id}/edit`);
		} else {
			setConfirm("edit"); // editing a Final or Shared one reopens it first
		}
	}

	async function handleConfirm() {
		setConfirmError("");

		if (confirm === "edit" || confirm === "reopen") {
			const result = await run(reopenTeamTransaction, {
				loading: "Reopening...",
				success: "Reopened as a draft",
			});
			if (!result.ok) return setConfirmError(result.error);
			setConfirm(null);
			if (confirm === "edit") router.push(`/admin/transactions/team/${id}/edit`);
			else router.refresh();
		}

		if (confirm === "delete") {
			const result = await run(deleteTeamTransaction, {
				loading: "Deleting...",
				success: "Team transaction deleted",
			});
			if (!result.ok) return setConfirmError(result.error);
			router.push("/admin/transactions");
			router.refresh();
		}
	}

	const confirmText: Record<Exclude<Confirm, null>, { title: string; body: string; button: string }> = {
		edit: {
			title: "Edit this team transaction?",
			body: "Editing reopens it as a draft: each player's share is taken off their balance until you finalize it again.",
			button: "Reopen and edit",
		},
		reopen: {
			title: "Reopen as a draft?",
			body: "Each player's share is taken off their balance (kept in history) until you finalize it again.",
			button: "Reopen",
		},
		delete: {
			title: "Delete this team transaction?",
			body: hasHistory || status !== "DRAFT"
				? "It's removed from the list and from every player's balance. A record is kept for history."
				: "This draft never counted toward any balance, so it's removed completely.",
			button: "Delete",
		},
	};

	const primary =
		status === "DRAFT" ? (
			<Button
				onClick={async () => {
					const r = await run(completeTeamTransaction, {
						loading: "Finalizing...",
						success: "Finalized: counted in balances",
					});
					if (r.ok) router.refresh();
				}}
				disabled={pending || !isBalanced}
				title={isBalanced ? undefined : "Shares must add up to the total"}>
				Finalize
			</Button>
		) : status === "COMPLETED" ? (
			<Button
				onClick={async () => {
					const r = await run(publishTeamTransaction, {
						loading: "Sharing...",
						success: "Shared with parents",
					});
					if (r.ok) router.refresh();
				}}
				disabled={pending}>
				Share with parents
			</Button>
		) : (
			<Button
				variant="outline"
				onClick={async () => {
					const r = await run(unpublishTeamTransaction, {
						loading: "Hiding...",
						success: "Hidden from parents",
					});
					if (r.ok) router.refresh();
				}}
				disabled={pending}>
				Hide from parents
			</Button>
		);

	return (
		<>
			<div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:justify-end">
				<div className="col-span-2 grid sm:col-span-1 sm:flex">{primary}</div>
				<Button variant="outline" onClick={handleEdit} disabled={pending}>
					Edit
				</Button>
				{status !== "DRAFT" ? (
					<Button variant="outline" onClick={() => setConfirm("reopen")} disabled={pending}>
						Reopen
					</Button>
				) : null}
				<Button
					variant="ghost"
					className={`text-destructive ${status === "DRAFT" ? "" : "col-span-2 sm:col-span-1"}`}
					onClick={() => setConfirm("delete")}
					disabled={pending}>
					Delete
				</Button>
			</div>

			<ConfirmDeleteDialog
				open={confirm !== null}
				onOpenChange={(open) => {
					if (!open) {
						setConfirm(null);
						setConfirmError("");
					}
				}}
				title={confirm ? confirmText[confirm].title : ""}
				description={confirm ? confirmText[confirm].body : ""}
				confirmLabel={confirm ? confirmText[confirm].button : ""}
				onConfirm={handleConfirm}
				error={confirmError}
				isPending={pending}
			/>
		</>
	);
}
