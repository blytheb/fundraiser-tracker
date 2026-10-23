import SummaryBlock from "@/components/reusable/SummaryBlock";

type SectionProps = {
	playerCount: number;
	fundraiserCount: number;
};

export default function SummarySection({
	playerCount,
	fundraiserCount,
}: SectionProps) {
	return (
		<section aria-label="Team overview" className="grid grid-cols-2 gap-3">
			<SummaryBlock title="Players" value={playerCount} label="On roster" />

			<SummaryBlock
				title="Fundraisers"
				value={fundraiserCount}
				label="Assigned to team"
			/>
		</section>
	);
}
