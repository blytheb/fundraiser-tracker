import React from "react";
// import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import type { Player } from "types/player";

type SectionProps = {
	participants: Player & { amount: numberl };
};

export default function DistributionSection({ participants }: SectionProps) {
	return (
		<Card>
			<CardHeader>
				<div className="flex items-center justify-between">
					<div>
						<CardTitle className="text-base">
							Participant Distribution
						</CardTitle>

						<p className="mt-1 text-sm text-muted-foreground">
							{participants.length} participants
						</p>
					</div>

					{/* <ToggleGroup
						type="single"
						className="h-8 overflow-hidden rounded-md border gap-0">
						<ToggleGroupItem
							value="equal"
							className="h-8 rounded-none border-0 px-3 bg-amber-200">
							Equal
						</ToggleGroupItem>

						<ToggleGroupItem
							value="custom"
							className=" h-8 rounded-none border-0 px-3 bg-green-500">
							Custom
						</ToggleGroupItem>
					</ToggleGroup> */}
				</div>
			</CardHeader>

			<CardContent className="space-y-1">
				{participants.map((participant) => {
					return (
						<div
							key={participant.id}
							className="flex items-center justify-between rounded-lg px-3 py-3 hover:bg-muted/50">
							<div>
								<p className="text-sm font-medium">
									{participant.firstName} {participant.lastName}
								</p>

								{/* <p className="text-xs text-muted-foreground">
									{fundraiser.teams[0]?.team.name}
								</p> */}
							</div>

							<p className="font-semibold">
								$
								{Number(participant.allocatedAmount).toLocaleString("en-US", {
									minimumFractionDigits: 2,
									maximumFractionDigits: 2,
								})}
							</p>
						</div>
					);
				})}
			</CardContent>
		</Card>
	);
}
