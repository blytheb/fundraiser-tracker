"use client";

import { useState, useEffect } from "react";

import { useRouter } from "next/navigation";
import type { PaymentMethod, ContributionType } from "@prisma/client";
import { updateContribution } from "@/features/fundraisers/actions/fundraiserContributions";

import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import ContributionForm from "@/components/forms/fundraisers/ContributionForm";
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

import type { FundraiserContributionListItem } from "@/features/fundraisers/types";

type DialogProps = {
	contribution: FundraiserContributionListItem;
	open: boolean;
	onOpenChange: (open: boolean) => void;
};

export default function EditContributionDialog({
	contribution,
	open,
	onOpenChange,
}: DialogProps) {
	const router = useRouter();

	const [amount, setAmount] = useState(String(contribution.amount));
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
				amount: Number(amount),
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
					<Button onClick={handleEdit}>Save Changes</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
