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
	error?: string;
	isPending?: boolean;
};

export default function ConfirmDeleteDialog({
	open,
	onOpenChange,
	title,
	description,
	confirmLabel,
	onConfirm,
	error,
	isPending,
}: ConfirmDeleteDialogProps) {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>{title}</DialogTitle>
					<DialogDescription>{description}</DialogDescription>
				</DialogHeader>
				{error && (
					<p className="text-sm text-destructive" role="alert">
						{error}
					</p>
				)}

				<DialogFooter>
					<Button
						type="button"
						variant="destructive"
						onClick={onConfirm}
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
