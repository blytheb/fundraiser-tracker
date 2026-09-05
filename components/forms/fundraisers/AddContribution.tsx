"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";

import { Input } from "@/components/ui/input";

import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

import { Textarea } from "@/components/ui/textarea";
import type { ContributionType, PaymentMethod } from "@prisma/client";
import { addContribution } from "@/features/fundraisers/actions/fundraiserContributions";

type AddFundraiserFundProps = {
	fundraiserId: string;
};

export default function AddContribution({
	fundraiserId,
}: AddFundraiserFundProps) {
	const [open, setOpen] = useState(false);
	const router = useRouter();

	const [amount, setAmount] = useState("");
	const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("CASH");
	const [source, setSource] = useState<ContributionType>("EVENT_PROFIT");
	const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
	const [description, setDescription] = useState("");

	const [isSubmitting, setIsSubmitting] = useState(false);

	async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();

		const parsedAmount = Number(amount);

		if (!parsedAmount || parsedAmount <= 0) {
			return;
		}

		try {
			setIsSubmitting(true);

			await addContribution({
				fundraiserId,
				source,
				amount: parsedAmount,
				paymentMethod,
				date,
				description: description || "",
			});

			// Reset form
			setAmount("");
			setPaymentMethod("CASH");
			setSource("EVENT_PROFIT");

			setDescription("");
			setDate(new Date().toISOString().split("T")[0]);

			// Close dialog
			setOpen(false);
			router.refresh();
		} catch (error) {
			console.error("Failed to add fundraiser fund:", error);
		} finally {
			setIsSubmitting(false);
		}
	}

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger
				render={
					<Button size="sm">
						<Plus className="mr-2 h-4 w-4" />
						Add Contribution
					</Button>
				}></DialogTrigger>

			<DialogContent>
				<form onSubmit={handleSubmit}>
					<DialogHeader>
						<DialogTitle>Contribution</DialogTitle>

						<DialogDescription>
							Add money collected from this fundraiser.
						</DialogDescription>
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
						<Button
							type="button"
							variant="outline"
							onClick={() => setOpen(false)}>
							Cancel
						</Button>

						<Button
							type="submit"
							disabled={isSubmitting || !amount || Number(amount) <= 0}>
							{isSubmitting ? "Adding..." : "Add Contribution"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
