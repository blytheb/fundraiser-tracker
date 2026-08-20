"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";

import { distributeFunds } from "@/lib/actions/fundraisers";

type Participant = {
	id: string;
	player: {
		firstName: string;
		lastName: string;
	};
};

type DistributeFundsDialogProps = {
	fundraiserId: string;
	totalAmount: number;
	participants: Participant[];
};

export default function DistributeFundsDialog({
	fundraiserId,
	totalAmount,
	participants,
}: DistributeFundsDialogProps) {
	const router = useRouter();
	const [open, setOpen] = useState(false);
	const [saving, setSaving] = useState(false);

	const amountPerPlayer =
		participants.length > 0 ? totalAmount / participants.length : 0;

	async function handleSave() {
		try {
			setSaving(true);

			await distributeFunds(fundraiserId);

			router.refresh();
			setOpen(false);
		} catch (error) {
			console.error("Failed to distribute funds:", error);
		} finally {
			setSaving(false);
		}
	}

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger render={<Button>Distribute Funds</Button>} />

			<DialogContent>
				<DialogHeader>
					<DialogTitle>Distribute Fundraiser Funds</DialogTitle>
				</DialogHeader>

				<div className="space-y-4 py-4">
					<div>
						<p className="text-sm text-muted-foreground">Total Raised</p>

						<p className="text-2xl font-bold">${totalAmount.toFixed(2)}</p>
					</div>

					<div>
						<p className="text-sm text-muted-foreground">Participants</p>

						<p className="font-medium">{participants.length}</p>
					</div>

					<div>
						<p className="text-sm text-muted-foreground">Amount Per Player</p>

						<p className="text-lg font-semibold">
							${amountPerPlayer.toFixed(2)}
						</p>
					</div>

					<div className="space-y-2">
						{participants.map((participant) => (
							<div
								key={participant.id}
								className="flex items-center justify-between rounded-md border p-3">
								<span>
									{participant.firstName} {participant.lastName}
								</span>

								<span className="font-medium">
									${amountPerPlayer.toFixed(2)}
								</span>
							</div>
						))}
					</div>
				</div>

				<DialogFooter>
					<Button
						variant="outline"
						onClick={() => setOpen(false)}
						disabled={saving}>
						Cancel
					</Button>

					<Button
						onClick={handleSave}
						disabled={saving || participants.length === 0 || totalAmount <= 0}>
						{saving ? "Saving..." : "Save Distribution"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
