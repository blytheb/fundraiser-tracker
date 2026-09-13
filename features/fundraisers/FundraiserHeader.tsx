import React from "react";
import {
	Avatar,
	AvatarFallback,
	AvatarGroup,
	AvatarImage,
	AvatarGroupCount,
} from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import PageHeader from "@/components/ui-reusable/PageHeader";

import FundraiserActions from "@/features/fundraisers/FundraiserActions";

import type { Team, Fundraiser } from "@prisma/client";
import type { FundraiserParticipantWithPlayerSerialized } from "@/features/fundraisers/types";

type SectionProps = {
	fundraiser: Fundraiser;
	totalRaised: number;
	fundraiserTeams: Team[];
	participants: FundraiserParticipantWithPlayerSerialized[];
};
export default function FundraiserHeader({
	fundraiser,
	totalRaised,
	fundraiserTeams,
	participants,
}: SectionProps) {
	const totalDistributed = participants.reduce(
		(total, participant) => total + participant.allocatedAmount,
		0,
	);
	const totalRemaining = totalRaised - totalDistributed;

	return (
		<Card className="overflow-hidden bg-gray-200">
			<CardContent className="p-5">
				<div className="flex items-start justify-between gap-4">
					<div>
						<Badge variant="secondary">{fundraiser.status}</Badge>
						<PageHeader
							heading={fundraiser.name}
							subheading={fundraiser.startDate.toLocaleDateString()}
						/>
					</div>
					<FundraiserActions fundraiser={fundraiser} />
				</div>

				<div className="space-x-2 my-4 ">
					{fundraiserTeams.map((team) => (
						<Badge key={team.id}>{team.name}</Badge>
					))}
				</div>
				<AvatarGroup>
					<Avatar>
						<AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
						<AvatarFallback>CN</AvatarFallback>
					</Avatar>
					<Avatar>
						<AvatarImage
							src="https://github.com/maxleiter.png"
							alt="@maxleiter"
						/>
						<AvatarFallback>LR</AvatarFallback>
					</Avatar>
					<Avatar>
						<AvatarImage
							src="https://github.com/evilrabbit.png"
							alt="@evilrabbit"
						/>
						<AvatarFallback>ER</AvatarFallback>
					</Avatar>
					<AvatarGroupCount>+3</AvatarGroupCount>
				</AvatarGroup>

				{/* <div className="pt-4 grid gap-4 grid-cols-3">
					<div>
						<p className="text-sm text-muted-foreground">Distributed:</p>
						<p className="text-lg font-semibold">
							${totalDistributed.toFixed(2)}
						</p>
					</div>
					<div>
						<p className="text-sm text-muted-foreground">Remaining</p>
						<p className="text-lg font-semibold">
							{" "}
							${totalRemaining.toFixed(2)}
						</p>
					</div>
				</div> */}
			</CardContent>
		</Card>
	);
}
