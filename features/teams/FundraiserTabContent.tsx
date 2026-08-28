import React from "react";
import Link from "next/link";
import { ChevronRight, Plus } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import AddFundraiserToTeamDialog from "@/components/forms/teams/AddFundraiserToTeamDialog";

import type { Fundraiser } from "@/types/fundraiser";

type TabProps = {
	teamId: string;
	fundraisers: Fundraiser[];
	availableFundraisers: Fundraiser[];
};

export default function FundraiserTabContent({
	teamId,
	fundraisers,
	availableFundraisers,
}: TabProps) {
	return (
		<>
			<div className="mb-3 flex items-center justify-between">
				<div>
					<h2 className="font-semibold">Fundraisers</h2>

					<p className="text-sm text-muted-foreground">
						{fundraisers.length} fundraisers
					</p>
				</div>

				<AddFundraiserToTeamDialog
					teamId={teamId}
					availableFundraisers={availableFundraisers}
				/>
			</div>

			<div className="space-y-3">
				{fundraisers.map((fundraiser) => (
					<Link
						key={fundraiser.id}
						href={`/fundraisers/${fundraiser.id}`}
						className="block">
						<Card className="transition-colors hover:bg-muted/50">
							<CardContent className="p-4">
								<div className="flex items-start justify-between gap-4">
									<div className="min-w-0">
										<p className="font-medium">{fundraiser.name}</p>

										<div className="mt-1 flex items-center gap-2">
											<Badge
												variant={
													fundraiser.status === "ACTIVE"
														? "default"
														: "secondary"
												}>
												{fundraiser.status}
											</Badge>

											<span className="text-xs text-muted-foreground">
												{fundraiser.participants} participants
											</span>
										</div>
									</div>

									<ChevronRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground" />
								</div>

								<div className="mt-4">
									<p className="text-xs uppercase tracking-wide text-muted-foreground">
										Total Raised
									</p>

									<p className="mt-1 text-xl font-bold">
										$
										{fundraiser.totalRaised.toLocaleString("en-US", {
											minimumFractionDigits: 2,
											maximumFractionDigits: 2,
										})}
									</p>
								</div>
							</CardContent>
						</Card>
					</Link>
				))}
			</div>
		</>
	);
}
