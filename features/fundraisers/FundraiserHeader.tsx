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
import PageHeader from "@/components/reusable/PageHeader";

import FundraiserActions from "@/features/fundraisers/FundraiserActions";
import { FundraiserParticipantWithPlayer } from "@/features/fundraisers/types";

import type { Team, Fundraiser } from "@prisma/client";

type SectionProps = {
	fundraiser: Fundraiser;
	financialSummary: {
		totalRaised: number;
		currentlyAllocated: number;
		availableToAllocate: number;
		participantCount: number;
	};
	fundraiserTeams: Team[];
	participants: FundraiserParticipantWithPlayer[];
};
export default function FundraiserHeader({
	fundraiser,
	financialSummary,
	fundraiserTeams,
	participants,
}: SectionProps) {
	return (
		<>
			<Card className="overflow-hidden bg-gray-200">
				<CardContent className="p-5">
					<div className="flex items-start justify-between gap-4">
						<div className="space-y-4">
							<Badge variant="secondary">
								{fundraiser.status === "DRAFT"
									? "Draft"
									: fundraiser.status === "COMPLETED"
										? "Completed"
										: "Published"}
							</Badge>

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
							<Avatar className="size-10">
								<AvatarImage
									src={
										participants[0].player.imageUrl ??
										`https://robohash.org/${participants[0].player.id}?set=set2`
									}
									alt={`${participants[0].player.firstName} ${participants[0].player.lastName}`}
								/>
								<AvatarFallback>
									{participants[0].player.firstName[0].toUpperCase()}
									{participants[0].player.lastName[0].toUpperCase()}
								</AvatarFallback>
							</Avatar>
							<Avatar className="size-10">
								<AvatarImage
									src={
										participants[1].player.imageUrl ??
										`https://robohash.org/${participants[1].player.id}?set=set2`
									}
									alt={`${participants[1].player.firstName} ${participants[1].player.lastName}`}
								/>
								<AvatarFallback>
									{participants[1].player.firstName[1].toUpperCase()}
									{participants[1].player.lastName[1].toUpperCase()}
								</AvatarFallback>
							</Avatar>
							<Avatar className="size-10">
								<AvatarImage
									src={
										participants[2].player.imageUrl ??
										`https://robohash.org/${participants[2].player.id}?set=set2`
									}
									alt={`${participants[2].player.firstName} ${participants[2].player.lastName}`}
								/>
								<AvatarFallback>
									{participants[2].player.firstName[2].toUpperCase()}
									{participants[2].player.lastName[2].toUpperCase()}
								</AvatarFallback>
							</Avatar>
							x<AvatarGroupCount>+{participants.length - 3}</AvatarGroupCount>
						</AvatarGroup>
					) : (
						<div className="flex">
							{participants.map((participant) => (
								<Avatar className="size-10" key={participant.player.id}>
									<AvatarImage
										src={
											participant.player.imageUrl ??
											`https://robohash.org/${participant.player.id}?set=set2`
										}
										alt={`${participant.player.firstName} ${participant.player.lastName}`}
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
		</>
	);
}
