import React from "react";
import { Separator } from "@/components/ui/separator";
import { ChevronsUpDown } from "lucide-react";

import AddFundraiserFund from "@/components/fundraisers/forms/AddFundraiserFund";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function MoneyBreakdownSection() {
	return (
		<Card>
			<CardContent className="space-y-3">
				<Collapsible className="flex flex-col gap-2">
					<div className="flex items-center justify-between gap-4">
						<CardTitle className="text-base">Money Breakdown</CardTitle>
						<CollapsibleTrigger className="inline-flex size-8 items-center justify-center rounded-md hover:bg-muted">
							<ChevronsUpDown />
							<span className="sr-only">Toggle details</span>
						</CollapsibleTrigger>
					</div>
					<div className="flex items-center justify-between rounded-md border px-4 py-2 text-sm">
						<span className="font-medium">Total Raised</span>
						<span className="font-medium">
							$
							{totalRaised.toLocaleString("en-US", {
								minimumFractionDigits: 2,
								maximumFractionDigits: 2,
							})}{" "}
						</span>
					</div>

					<CollapsibleContent className="flex flex-col gap-2">
						<Separator />
						{funds.map((fund) => {
							return (
								<div
									key={fund.id}
									className="rounded-md border px-4 py-2 text-sm flex justify-between">
									<p className="text-muted-foreground">{fund.type}</p>
									<p className="text-muted-foreground">
										$
										{fund.amount.toLocaleString("en-US", {
											minimumFractionDigits: 2,
											maximumFractionDigits: 2,
										})}
									</p>
								</div>
							);
						})}
						<AddFundraiserFund fundraiserId={fundraiser.id} />
					</CollapsibleContent>
				</Collapsible>
			</CardContent>
		</Card>
	);
}
