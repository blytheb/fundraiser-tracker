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
					<p className="wrap-break-words text-xs font-medium text-muted-foreground sm:text-sm">
						{title}
					</p>
				)}
				<p className="mt-2 wrap-break-words text-2xl leading-none font-bold tabular-nums">
					{value}
				</p>
				{label && <p className="mt-1 text-xs text-muted-foreground">{label}</p>}
			</CardContent>
		</Card>
	);
}
