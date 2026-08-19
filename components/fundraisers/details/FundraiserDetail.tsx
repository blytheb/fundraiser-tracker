"use client";

import type { Fundraiser } from "@/types/fundraisers";

type Props = {
	fundraiser: Fundraiser;
};

export default function FundraiserDetail({ fundraiser }: Props) {
	return (
		<div className="border">
			<p>{fundraiser.name}</p>
			<p>{fundraiser.status}</p>
			<p>{fundraiser.startDate.toLocaleDateString()}</p>
		</div>
	);
}
