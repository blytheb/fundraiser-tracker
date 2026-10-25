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
import ContributionForm from "@/components/forms/fundraisers/ContributionForm";
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
						<Plus className="h-3 w-3" />
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

					<ContributionForm
						amount={amount}
						source={source}
						paymentMethod={paymentMethod}
						date={date}
						description={description}
						onAmountChange={setAmount}
						onSourceChange={setSource}
						onPaymentMethodChange={setPaymentMethod}
						onDateChange={setDate}
						onDescriptionChange={setDescription}
					/>

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
