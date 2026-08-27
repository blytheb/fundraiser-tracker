import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Fundraiser, Team } from "@/prisma/client";

type SectionProps = {
	fundraiser: Fundraiser;
	teams: Team;
};

export default function DetailSection({ fundraiser, teams }: SectionProps) {
	return (
		<Card>
			<CardHeader>
				<CardTitle className="text-base">Fundraiser Details</CardTitle>
			</CardHeader>

			<CardContent className="space-y-4">
				<div className="flex justify-between gap-4 text-sm">
					<span className="text-muted-foreground">Date</span>

					<span className="font-medium">
						{fundraiser.startDate.toLocaleDateString()}
					</span>
				</div>

				<div className="flex justify-between gap-4 text-sm">
					<span className="text-muted-foreground">Teams</span>

					<span className="font-medium">
						{teams.map((team) => team.name).join(", ")}
					</span>
				</div>

				<div className="flex justify-between gap-4 text-sm">
					<span className="text-muted-foreground">Participants</span>

					{/* <span className="font-medium">{fundraiser.participants.length}</span> */}
				</div>

				<div className="flex justify-between gap-4 text-sm">
					<span className="text-muted-foreground">Distribution</span>

					<span className="font-medium">Equal</span>
				</div>
			</CardContent>
		</Card>
	);
}
