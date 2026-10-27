"use client";

import { useState } from "react";
import {
	Dialog,
	DialogDescription,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type ConfirmDeleteDialogProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	title: string;
	description: string;
	confirmLabel: string;
	onConfirm: () => void | Promise<void>;
};

export default function ConfirmDeleteDialog({
	open,
	onOpenChange,
	title,
	description,
	confirmLabel,
	onConfirm,
}: ConfirmDeleteDialogProps) {
	const [isPending, setIsPending] = useState(false);

	async function handleConfirm() {
		setIsPending(true);

		try {
			await onConfirm();
		} finally {
			setIsPending(false);
		}
	}
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>{title}</DialogTitle>
					<DialogDescription>{description}</DialogDescription>
				</DialogHeader>

				<DialogFooter>
					<Button
						type="button"
						variant="destructive"
						onClick={handleConfirm}
						disabled={isPending}
						aria-busy={isPending}
						data-testid="confirm-delete-button">
						{isPending ? "Please wait..." : confirmLabel}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
