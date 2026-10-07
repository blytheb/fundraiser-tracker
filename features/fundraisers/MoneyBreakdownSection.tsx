"use client";

import React, { useState } from "react";
import ContributionActions from "@/features/fundraisers/ContributionActions";
import { Button } from "@/components/ui/button";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronsUpDown } from "lucide-react";

import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import type { FundraiserContributionListItem } from "@/features/fundraisers/types";
import AddContribution from "@/components/forms/fundraisers/AddContribution";
import { FundraiserStatus } from "@prisma/client";

type SectionProps = {
	fundraiserId: string;
	status: FundraiserStatus;
	totalRaised: number;
	funds: FundraiserContributionListItem[];
};
export default function MoneyBreakdownSection({
	fundraiserId,
	status,
	totalRaised,
	funds,
}: SectionProps) {
	const isDraft = status === "DRAFT";
	const [listOpen, setListOpen] = useState(false);

	const sourceLabels = {
		EVENT_PROFIT: "Event Profit",
		SALES: "Sales",
		TIPS: "Tips",
		OTHER: "Other",
	};

	return (
		<Card>
			<CardHeader>
				<div className="flex items-center justify-between">
					<div>
						<CardTitle className="text-base">Money Breakdown</CardTitle>
					</div>
					<div className="flex items-center gap-2">
						{isDraft && <AddContribution fundraiserId={fundraiserId} />}
					</div>
				</div>
			</CardHeader>

			<CardContent className="space-y-3">
				<Collapsible
					className="flex flex-col gap-2"
					open={listOpen}
					onOpenChange={setListOpen}>
					<div className="flex items-center justify-between rounded-md border px-4 py-2 text-sm">
						<span className="font-bold text-xl">Total Fundraised</span>
						<div className="flex gap-4 justify-center items-center">
							<span className="font-bold text-xl">
								$
								{totalRaised.toLocaleString("en-US", {
									minimumFractionDigits: 2,
									maximumFractionDigits: 2,
								})}
							</span>
							{funds.length > 0 && (
								<CollapsibleTrigger
									render={
										<Button variant="ghost" size="icon" className="size-8">
											<ChevronsUpDown />
											<span className="sr-only">Toggle details</span>
										</Button>
									}
								/>
							)}
						</div>
					</div>
					<CollapsibleContent className="flex flex-col gap-2">
						{funds.map((fund) => {
							return (
								<div
									key={fund.id}
									className="rounded-md border px-4 py-2 text-sm flex justify-between items-center">
									<p className="text-muted-foreground">
										{sourceLabels[fund.source]}
									</p>

									<div className="flex gap-4 items-center justify-center">
										<p className="text-muted-foreground">
											{fund.amount.toLocaleString("en-US", {
												style: "currency",
												currency: "USD",
											})}
										</p>
										{isDraft && <ContributionActions contribution={fund} />}
									</div>
								</div>
							);
						})}
					</CollapsibleContent>
				</Collapsible>
				{/* 

					<CollapsibleContent className="flex flex-col gap-2">
						{" "}
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
					</CollapsibleContent>
				</Collapsible> */}
			</CardContent>
		</Card>
	);
}
