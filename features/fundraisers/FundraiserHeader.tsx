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

import PlayerAvatar from "@/components/ui-reusable/PlayerAvatar";
import FundraiserActions from "@/features/fundraisers/FundraiserActions";
import { FundraiserParticipantWithPlayer } from "@/features/fundraisers/types";

import type { Team, Fundraiser } from "@prisma/client";
import { FundraiserParticipant } from "@prisma/client";

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
							{/* In progress = !isComplete & !isPublished
							published but incomplete = !isComplete & isPublished
							completed but unpublished= isComplete & !isPublished
							completed and published = isComplete & isPublished */}
							{fundraiser.isCompleted ? (
								<Badge variant="secondary">Completed</Badge>
							) : (
								<Badge variant="secondary">Draft</Badge>
							)}
							{fundraiser.isPublished ? (
								<Badge>PUBLISHED</Badge>
							) : (
								<Badge>NOT PUBLISHED</Badge>
							)}
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
							<PlayerAvatar
								key={participants[0].id}
								player={participants[0].player}
							/>
							<PlayerAvatar
								key={participants[1].id}
								player={participants[1].player}
							/>
							<PlayerAvatar
								key={participants[2].id}
								player={participants[2].player}
							/>

							<AvatarGroupCount>+{participants.length - 3}</AvatarGroupCount>
						</AvatarGroup>
					) : (
						<div className="flex">
							{participants.map((participant) => (
								<PlayerAvatar
									key={participant.player.id}
									player={participant.player}
								/>
							))}
						</div>
					)}
				</CardContent>
			</Card>
		</>
	);
}
