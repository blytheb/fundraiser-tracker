import React from "react";
import { Card, CardContent } from "@/components/ui/card";

type SummaryBlockProps = {
	title?: string;
	value: number;
	label?: string;
};

export default function SummaryBlock({
	title,
	value,
	label,
}: SummaryBlockProps) {
	return (
		<Card>
			<CardContent className="p-4">
				{title && (
					<p className="text-xs font-medium text-muted-foreground sm:text-sm">
						{title}
					</p>
				)}

				<p className="mt-2 text-2xl font-bold">{value}</p>

				{label && <p className="text-xs text-muted-foreground">{label}</p>}
			</CardContent>
		</Card>
	);
}
