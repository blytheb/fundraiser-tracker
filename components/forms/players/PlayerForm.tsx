"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

type PlayerFormProps = {
	firstName: string;
	lastName: string;
	onFirstNameChange: (value: string) => void;
	onLastNameChange: (value: string) => void;
};

export default function PlayerForm({
	firstName,
	lastName,
	onFirstNameChange,
	onLastNameChange,
}: PlayerFormProps) {
	return (
		<div className="space-y-4 py-4">
			<div className="space-y-2">
				<Label htmlFor="player-first-name">Player First Name</Label>
				<Input
					id="player-first-name"
					value={firstName}
					onChange={(e) => onFirstNameChange(e.target.value)}
					required
				/>
			</div>

			<div className="space-y-2">
				<Label htmlFor="player-last-name">Player Last Name</Label>
				<Input
					id="player-last-name"
					value={lastName}
					onChange={(e) => onLastNameChange(e.target.value)}
					required
				/>
			</div>
		</div>
	);
}
