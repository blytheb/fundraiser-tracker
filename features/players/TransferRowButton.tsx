"use client";

import { useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import ConfirmDeleteDialog from "@/components/dialogs/ConfirmDeleteDialog";
import { deletePotTransfer } from "@/features/transactions/actions/pot-transfers";

// A history row for a move between pots; clicking it offers to undo the move.
export default function TransferRowButton({
	transferId,
	className,
	children,
}: {
	transferId: string;
	className: string;
	children: ReactNode;
}) {
	const router = useRouter();
	const [open, setOpen] = useState(false);
	const [error, setError] = useState("");
	const [pending, setPending] = useState(false);

	async function handleUndo() {
		setError("");
		setPending(true);
		const result = await deletePotTransfer(transferId);
		setPending(false);
		if (!result.ok) {
			setError(result.error);
			return;
		}
		toast.success("Move undone");
		setOpen(false);
		router.refresh();
	}

	return (
		<>
			<button type="button" onClick={() => setOpen(true)} className={`w-full text-left ${className}`}>
				{children}
			</button>
			<ConfirmDeleteDialog
				open={open}
				onOpenChange={(next) => {
					setOpen(next);
					if (!next) setError("");
				}}
				title="Undo this move?"
				description="The money goes back to the pot it came from. The move is kept in history as undone."
				confirmLabel="Undo move"
				onConfirm={handleUndo}
				error={error}
				isPending={pending}
			/>
		</>
	);
}
