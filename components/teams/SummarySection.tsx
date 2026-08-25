import React from "react";
import SummaryBlock from "@/components/SummaryBlock";

export default function SummarySection() {
	return (
		<div className="mb-6 grid grid-cols-3 gap-2 sm:gap-4">
			<SummaryBlock title={"Players"} value="14" />
			<SummaryBlock title="Fundraiser" value="2" label="Active" />
			<SummaryBlock title="Trips" value="1" label="Upcoming" />
		</div>
	);
}
