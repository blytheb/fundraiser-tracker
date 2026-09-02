"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

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

type AddFundraiserFundProps = {
	fundraiserId: string;
};

export default function AddFundraiserFund({
	fundraiserId,
}: AddFundraiserFundProps) {
	const [open, setOpen] = useState(false);

	const [type, setType] = useState<"SALES" | "EVENT_PROFIT" | "TIPS" | "OTHER">(
		"EVENT_PROFIT",
	);

	const [amount, setAmount] = useState("");
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

			await addFundraiserFund({
				fundraiserId,
				type,
				amount: parsedAmount,
				description: description || undefined,
			});

			// Reset form
			setAmount("");
			setDescription("");
			setType("EVENT_PROFIT");

			// Close dialog
			setOpen(false);
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
						Add Funds
					</Button>
				}></DialogTrigger>

			<DialogContent>
				<form onSubmit={handleSubmit}>
					<DialogHeader>
						<DialogTitle>Add Funds</DialogTitle>

						<DialogDescription>
							Add additional money collected from this fundraiser.
						</DialogDescription>
					</DialogHeader>

					<div className="space-y-4 py-4">
						{/* Type */}
						<div className="space-y-2">
							<label className="text-sm font-medium">Fund Type</label>

							<Select
								value={type}
								onValueChange={(value) =>
									setType(value as "SALES" | "EVENT_PROFIT" | "TIPS" | "OTHER")
								}>
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

						{/* Amount */}
						<div className="space-y-2">
							<label className="text-sm font-medium">Amount</label>

							<Input
								type="number"
								step="0.01"
								min="0"
								placeholder="0.00"
								value={amount}
								onChange={(event) => setAmount(event.target.value)}
							/>
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
							{isSubmitting ? "Adding..." : "Add Funds"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
