"use client";

import { useRouter } from "next/navigation";
import { deleteFundraiser } from "@/features/fundraisers/actions/fundraisers";

import {
	Dialog,
	DialogDescription,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";

import type { Fundraiser } from "@prisma/client";

type DeleteFundraiserDialogProps = {
	fundraiser: Fundraiser;
	open: boolean;
	onOpenChange: (open: boolean) => void;
};

export default function DeleteFundraiserDialog({
	fundraiser,
	open,
	onOpenChange,
}: DeleteFundraiserDialogProps) {
	const router = useRouter();

	async function handleDelete() {
		try {
			await deleteFundraiser(fundraiser.id);
			router.refresh();
			onOpenChange(false);
		} catch (error) {
			console.error("Failed to delete fundraiser:", error);
		}
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Delete {fundraiser.name}</DialogTitle>
				</DialogHeader>

				<DialogDescription>
					Are you sure you want to delete this fundraiser?
				</DialogDescription>

				<DialogFooter>
					<Button onClick={handleDelete}>Yes, delete this fundraiser</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
