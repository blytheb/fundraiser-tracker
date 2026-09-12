import React from "react";
import SummaryBlock from "@/components/ui-reusable/SummaryBlock";

type SectionProps = {
	playerCount: number;
	fundraiserCount: number;
};

export default function SummarySection({
	playerCount,
	fundraiserCount,
}: SectionProps) {
	return (
		<div className="mb-6 grid grid-cols-2 gap-2 sm:gap-4">
			<SummaryBlock title="Players" value={playerCount} label="Total" />
			<SummaryBlock title="Fundraiser" value={fundraiserCount} label="Active" />
			{/* <SummaryBlock title="Trips" value={1} label="Upcoming" /> */}
		</div>
	);
}
