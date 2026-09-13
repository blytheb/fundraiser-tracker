"use client";

import React, { useState } from "react";
import { Separator } from "@/components/ui/separator";
import { ChevronsDown, ChevronsUp } from "lucide-react";
import ContributionActions from "@/features/fundraisers/ContributionActions";

// import AddFundraiserCon from "@/components/forms/fundraisers/AddFundraiserFund";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import type { FundraiserContributionListItem } from "@/features/fundraisers/types";
import AddContribution from "@/components/forms/fundraisers/AddContribution";
import { FundraiserStatus } from "@prisma/client";

type SectionProps = {
	fundraiserId: string;
	status: FundraiserStatus;
	total: number;
	funds: FundraiserContributionListItem[];
};
export default function MoneyBreakdownSection({
	fundraiserId,
	status,
	total,
	funds,
}: SectionProps) {
	const isDraft = status === "DRAFT";
	const [fundsOpen, setFundsOpen] = useState(false);
	return (
		<Card>
			<CardContent className="space-y-3">
				<Collapsible
					className="flex flex-col gap-2"
					open={fundsOpen}
					onOpenChange={setFundsOpen}>
					<div className="flex items-center justify-between gap-4">
						<CardTitle className="text-base">Money Breakdown</CardTitle>
						{isDraft && <AddContribution fundraiserId={fundraiserId} />}
					</div>
					{funds.map((fund) => {
						return (
							<div
								key={fund.id}
								className="rounded-md border px-4 py-2 text-sm flex justify-between">
								<p className="text-muted-foreground">{fund.source}</p>
								<p className="text-muted-foreground">
									{fund.amount.toLocaleString("en-US", {
										style: "currency",
										currency: "USD",
									})}
								</p>
								{isDraft && <ContributionActions contribution={fund} />}
							</div>
						);
					})}
					{/* <div className="flex items-center justify-between rounded-md border px-4 py-2 text-sm">
						<span className="font-medium">
							Total $
							{total.toLocaleString("en-US", {
								minimumFractionDigits: 2,
								maximumFractionDigits: 2,
							})}
						</span>
					</div> */}

					<CollapsibleContent className="flex flex-col gap-2"></CollapsibleContent>
				</Collapsible>
			</CardContent>
		</Card>
	);
}
