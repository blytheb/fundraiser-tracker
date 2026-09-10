import React from "react";
import {
	Avatar,
	AvatarFallback,
	AvatarGroup,
	AvatarImage,
} from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

import FundraiserActions from "@/features/fundraisers/FundraiserActions";

import type { Team, Fundraiser } from "@prisma/client";
import type { FundraiserParticipantWithPlayerSerialized } from "@/features/fundraisers/types";

type SectionProps = {
	fundraiser: Fundraiser;
	totalRaised: number;
	fundraiserTeams: Team[];
	participants: FundraiserParticipantWithPlayerSerialized;
};
export default function FundraiserHeader({
	fundraiser,
	totalRaised,
	fundraiserTeams,
	participants,
}: SectionProps) {
	return (
		<Card className="overflow-hidden bg-gray-200">
			<CardContent className="p-5">
				<div className="flex items-start justify-between gap-4">
					<div>
						<Badge variant="secondary">{fundraiser.status}</Badge>

						<p className="text-lg font-semibold">{fundraiser.name}</p>

						<p className="mt-1 text-sm text-muted-foreground">
							{fundraiser.startDate.toLocaleDateString()}
						</p>
					</div>
					<FundraiserActions fundraiser={fundraiser} />
				</div>

				<div className="mt-6">
					<p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
						Total Raised
					</p>

					<p className="mt-1 text-4xl font-bold tracking-tight">
						$
						{totalRaised.toLocaleString("en-US", {
							minimumFractionDigits: 2,
							maximumFractionDigits: 2,
						})}
					</p>
				</div>

				<div className="space-x-2 mt-4 ">
					{fundraiserTeams.map((team) => (
						<Badge key={team.id}>{team.name}</Badge>
					))}
				</div>
			</CardContent>
		</Card>
	);
}
