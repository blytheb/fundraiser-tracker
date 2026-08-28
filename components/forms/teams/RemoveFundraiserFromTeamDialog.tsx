"use client";

import {
	Dialog,
	DialogDescription,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

import { useRouter } from "next/navigation";
import { removeTeamFromFundraiser } from "@/features/fundraisers/actions/fundraiserTeams";

import type { Fundraiser } from "@/prisma/client";

type DialogProps = {
	teamId: string;
	fundraiser: Fundraiser;
	open: boolean;
	onOpenChange: (open: boolean) => void;
};

export default function RemoveFundraiserFromTeamDialog({
	teamId,
	fundraiser,
	open,
	onOpenChange,
}: DialogProps) {
	const router = useRouter();

	async function handleDelete() {
		try {
			await removeTeamFromFundraiser(fundraiser.id, teamId);
			router.refresh();
			onOpenChange(false);
		} catch (error) {
			console.error("Failed to remove player from team:", error);
		}
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Remove {fundraiser.name}</DialogTitle>
				</DialogHeader>

				<DialogDescription>
					Are you sure you want to remove this fundraiser from this team?
				</DialogDescription>

				<DialogFooter>
					<Button onClick={handleDelete}>
						Yes, remove this {fundraiser.name}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
