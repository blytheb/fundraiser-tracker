import React from "react";
import { Badge } from "@/components/ui/badge";

import type { Fundraiser } from "@/types/fundraiser";

type FundraiserSmallCardProps = {
	fundraiser: Fundraiser;
};

export default function FundraiserSmallCard({
	fundraiser,
}: FundraiserSmallCardProps) {
	return (
		<div className="mb-6 flex items-center gap-4 border">
			<div>
				<div className="flex items-center gap-3">
					<h1 className="text-2xl font-bold">{fundraiser.name}</h1>
					<p className="text-muted-foreground">
						{fundraiser.startDate.toLocaleDateString()}
					</p>
				</div>
				<Badge variant="secondary">{fundraiser.status}</Badge>
			</div>
		</div>
	);
}
