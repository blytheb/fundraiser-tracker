"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

type TeamFormProps = {
	name: string;
	onNameChange: (value: string) => void;
};

export default function TeamForm({ name, onNameChange }: TeamFormProps) {
	return (
		<div className="space-y-4 py-4">
			<div className="space-y-2">
				<Label htmlFor="team-name">Team Name</Label>
				<Input
					id="team-name"
					value={name}
					onChange={(e) => onNameChange(e.target.value)}
					required
				/>
			</div>
		</div>
	);
}
