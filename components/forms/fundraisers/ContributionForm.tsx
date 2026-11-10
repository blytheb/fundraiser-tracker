"use client";

import type { ContributionType, PaymentMethod } from "@prisma/client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { CONTRIBUTION_SOURCE_LABELS, PAYMENT_METHOD_LABELS } from "@/lib/labels";

type ContributionFormProps = {
	amount: string;
	source: ContributionType;
	paymentMethod: PaymentMethod;
	date: string;
	description: string;
	onAmountChange: (value: string) => void;
	onSourceChange: (value: ContributionType) => void;
	onPaymentMethodChange: (value: PaymentMethod) => void;
	onDateChange: (value: string) => void;
	onDescriptionChange: (value: string) => void;
};

export default function ContributionForm({
	amount,
	source,
	paymentMethod,
	date,
	description,
	onAmountChange,
	onSourceChange,
	onPaymentMethodChange,
	onDateChange,
	onDescriptionChange,
}: ContributionFormProps) {
	return (
		<div className="space-y-4 py-4">
			<div className="space-y-2">
				<Label htmlFor="contribution-amount">Amount</Label>
				<Input
					id="contribution-amount"
					type="number"
					step="0.01"
					min="0.01"
					placeholder="0.00"
					value={amount}
					onChange={(event) => onAmountChange(event.target.value)}
					required
				/>
			</div>

			<div className="space-y-2">
				<Label htmlFor="contribution-source">Contribution Type</Label>
				<Select
					items={CONTRIBUTION_SOURCE_LABELS}
					value={source}
					onValueChange={(value) => onSourceChange(value as ContributionType)}>
					<SelectTrigger id="contribution-source">
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						{Object.entries(CONTRIBUTION_SOURCE_LABELS).map(([value, label]) => (
							<SelectItem key={value} value={value}>
								{label}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>

			<div className="space-y-2">
				<Label htmlFor="contribution-payment-method">Payment Method</Label>
				<Select
					items={PAYMENT_METHOD_LABELS}
					value={paymentMethod}
					onValueChange={(value) =>
						onPaymentMethodChange(value as PaymentMethod)
					}>
					<SelectTrigger id="contribution-payment-method">
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						{Object.entries(PAYMENT_METHOD_LABELS).map(([value, label]) => (
							<SelectItem key={value} value={value}>
								{label}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>

			<div className="space-y-2">
				<Label htmlFor="contribution-date">Contribution Date</Label>
				<Input
					id="contribution-date"
					type="date"
					value={date}
					onChange={(event) => onDateChange(event.target.value)}
					required
				/>
			</div>

			<div className="space-y-2">
				<Label htmlFor="contribution-description">
					Description <span className="text-muted-foreground">(optional)</span>
				</Label>
				<Textarea
					id="contribution-description"
					placeholder="e.g. Tournament event profit"
					value={description}
					onChange={(event) => onDescriptionChange(event.target.value)}
				/>
			</div>
		</div>
	);
}
