"use client";

import { useState, useEffect } from "react";

import { useRouter } from "next/navigation";
import { updateContribution } from "@/features/fundraisers/actions/fundraiserContributions";

import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";

import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

import type { FundraiserContribution } from "@/prisma/client";

type DialogProps = {
	contribution: FundraiserContribution;
	open: boolean;
	onOpenChange: (open: boolean) => void;
};

export default function EditContributionDialog({
	contribution,
	open,
	onOpenChange,
}: DialogProps) {
	const router = useRouter();

	const [amount, setAmount] = useState(contribution.amount);
	const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(
		contribution.paymentMethod,
	);
	const [source, setSource] = useState<ContributionType>(contribution.source);
	const [date, setDate] = useState(
		contribution.date.toISOString().split("T")[0],
	);
	const [description, setDescription] = useState(
		contribution.description ?? "",
	);

	// useEffect(() => {
	// 	setName(fundraiser.name);
	// }, [fundraiser]);

	async function handleEdit() {
		try {
			await updateContribution(contribution.id, {
				amount,
				paymentMethod,
				source,
				date,
				description,
			});
			router.refresh();
			onOpenChange(false);
		} catch (error) {
			console.error("Failed to edit contribution:", error);
		}
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Edit this Fundraiser</DialogTitle>
				</DialogHeader>

				<div className="space-y-4 py-4">
					{/* Amount */}
					<div className="space-y-2">
						<label className="text-sm font-medium">Amount</label>

						<Input
							type="number"
							step="1.00"
							min="0"
							placeholder="0.00"
							value={amount}
							onChange={(event) => setAmount(event.target.value)}
						/>
					</div>

					{/* Contribution Type */}
					<div className="space-y-2">
						<label className="text-sm font-medium">Contribution Type</label>

						<Select
							value={source}
							onValueChange={(value) => setSource(value as ContributionType)}>
							<SelectTrigger>
								<SelectValue />
							</SelectTrigger>

							<SelectContent>
								<SelectItem value="SALES">Sales</SelectItem>

								<SelectItem value="EVENT_PROFIT">Event Profit</SelectItem>

								<SelectItem value="TIPS">Tips</SelectItem>

								<SelectItem value="OTHER">Other</SelectItem>
							</SelectContent>
						</Select>
					</div>

					{/* Payment method */}
					<div className="space-y-2">
						<label className="text-sm font-medium">Payment Method</label>

						<Select
							value={paymentMethod}
							onValueChange={(value) =>
								setPaymentMethod(value as PaymentMethod)
							}>
							<SelectTrigger>
								<SelectValue />
							</SelectTrigger>

							<SelectContent>
								<SelectItem value="CASH">Cash</SelectItem>

								<SelectItem value="CHECK">Check</SelectItem>

								<SelectItem value="VENMO">Venmo</SelectItem>
								<SelectItem value="OTHER">Other</SelectItem>
							</SelectContent>
						</Select>
					</div>

					{/* Description */}
					<div className="space-y-2">
						<label className="text-sm font-medium">
							Description{" "}
							<span className="text-muted-foreground">(optional)</span>
						</label>

						<Textarea
							placeholder="e.g. Tournament event profit"
							value={description}
							onChange={(event) => setDescription(event.target.value)}
						/>
					</div>
				</div>

				<DialogFooter>
					<Button onClick={handleEdit}>Save Changes</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
