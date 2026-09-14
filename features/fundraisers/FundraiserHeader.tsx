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
	console.log(participants);
	return (
		<Card className="overflow-hidden bg-gray-200">
			<CardContent className="p-5">
				<div className="flex items-start justify-between gap-4">
					<div className="space-y-4">
						<Badge variant="secondary">{fundraiser.status}</Badge>
						<PageHeader
							heading={fundraiser.name}
							subheading={fundraiser.description}
						/>
						<p>Event Date: {fundraiser.startDate.toLocaleDateString()}</p>
					</div>
					<FundraiserActions fundraiser={fundraiser} />
				</div>

				<div className="space-x-2 my-4 ">
					{fundraiserTeams.map((team) => (
						<Badge key={team.id}>{team.name}</Badge>
					))}
				</div>
				{participants.length > 3 ? (
					<AvatarGroup>
						<Avatar key={participants[0].id}>
							<AvatarImage
								src={participants[0].player.imageUrl}
								alt={participants[0].player.firstName}
							/>
							<AvatarFallback>
								{participants[0].player.firstName[0]}
								{participants[0].player.lastName[0]}
							</AvatarFallback>
						</Avatar>
						<Avatar key={participants[1].id}>
							<AvatarImage
								src={participants[1].player.imageUrl}
								alt={participants[1].player.firstname}
							/>
							<AvatarFallback>
								{participants[1].player.firstName[0]}
								{participants[1].player.lastName[0]}
							</AvatarFallback>
						</Avatar>
						<Avatar key={participants[2].id}>
							<AvatarImage
								src={participants[1].player.imageUrl}
								alt={participants[1].player.firstname}
							/>
							<AvatarFallback>
								{participants[2].player.firstName[0]}
								{participants[2].player.lastName[0]}
							</AvatarFallback>
						</Avatar>
						<AvatarGroupCount>+{participants.length - 3}</AvatarGroupCount>
					</AvatarGroup>
				) : (
					<div className="flex">
						{participants.map((participant) => (
							<Avatar key={participant.id}>
								<AvatarImage
									src={participant.player.imageUrl ?? undefined}
									alt={participant.player.firstName}
								/>
								<AvatarFallback>
									{participant.player.firstName[0].toUpperCase()}
									{participant.player.lastName[0].toUpperCase()}
								</AvatarFallback>
							</Avatar>
						))}
					</div>
				)}
			</CardContent>
		</Card>
	);
}
