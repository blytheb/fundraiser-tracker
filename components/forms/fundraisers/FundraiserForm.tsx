"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

type FundraiserFormProps = {
	name: string;
	description: string;
	startDate: string;
	onNameChange: (value: string) => void;
	onDescriptionChange: (value: string) => void;
	onStartDateChange: (value: string) => void;
};

export default function FundraiserForm({
	name,
	description,
	startDate,
	onNameChange,
	onDescriptionChange,
	onStartDateChange,
}: FundraiserFormProps) {
	return (
		<div className="space-y-4 py-4">
			<div className="space-y-2">
				<Label htmlFor="fundraiser-name">Fundraiser Name</Label>
				<Input
					id="fundraiser-name"
					value={name}
					onChange={(e) => onNameChange(e.target.value)}
					required
				/>
			</div>

			<div className="space-y-2">
				<Label htmlFor="fundraiser-description">Fundraiser Description</Label>
				<Input
					id="fundraiser-description"
					value={description}
					onChange={(e) => onDescriptionChange(e.target.value)}
				/>
			</div>

			<div className="space-y-2">
				<Label htmlFor="fundraiser-start-date">Fundraiser Date</Label>
				<Input
					id="fundraiser-start-date"
					type="date"
					value={startDate}
					onChange={(e) => onStartDateChange(e.target.value)}
					required
				/>
			</div>
		</div>
	);
}
