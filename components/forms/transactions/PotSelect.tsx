"use client";

import type { Pot } from "@prisma/client";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { POTS, POT_LABELS } from "@/lib/labels";

// Which pot money goes into or comes out of. General is the default for fundraiser money.
export default function PotSelect({
	id,
	value,
	onChange,
	exclude,
}: {
	id: string;
	value: Pot;
	onChange: (pot: Pot) => void;
	exclude?: Pot; // e.g. the "from" pot when moving money
}) {
	const options = POTS.filter((pot) => pot !== exclude);

	return (
		<Select
			items={POT_LABELS}
			value={value}
			onValueChange={(next) => onChange(next as Pot)}>
			<SelectTrigger id={id} className="w-full">
				<SelectValue />
			</SelectTrigger>
			<SelectContent>
				{options.map((pot) => (
					<SelectItem key={pot} value={pot}>
						{POT_LABELS[pot]}
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	);
}
