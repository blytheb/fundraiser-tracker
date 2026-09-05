"use client";

import { useRouter } from "next/navigation";
import { deleteContribution } from "@/features/fundraisers/actions/fundraiserContributions";

import {
	Dialog,
	DialogDescription,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";

import type { FundraiserContribution } from "@prisma/client";

type DialogProps = {
	contribution: FundraiserContribution;
	open: boolean;
	onOpenChange: (open: boolean) => void;
};

export default function DeleteContributionDialog({
	contribution,
	open,
	onOpenChange,
}: DialogProps) {
	const router = useRouter();

	async function handleDelete() {
		try {
			await deleteContribution(contribution.id);
			router.refresh();
			onOpenChange(false);
		} catch (error) {
			console.error("Failed to delete contribution:", error);
		}
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Delete Contribution</DialogTitle>
				</DialogHeader>

				<DialogDescription>
					Are you sure you want to delete this contribution?
				</DialogDescription>

				<DialogFooter>
					<Button onClick={handleDelete}>Yes, delete this contribution</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
