import React from "react";
import {
	Avatar,
	AvatarFallback,
	AvatarGroup,
	AvatarGroupCount,
	AvatarImage,
} from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ButtonGroup } from "@/components/ui/button-group";
import { PlusIcon, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function SummarySection() {
	return (
		<Card className="overflow-hidden bg-gray-200">
			<CardContent className="p-5">
				<div className="flex items-start justify-between gap-4">
					<div>
						<p className="text-lg font-semibold">{fundraiser.name}</p>

						<p className="mt-1 text-sm text-muted-foreground">
							{fundraiser.startDate.toLocaleDateString()}
						</p>
					</div>

					<Badge variant="secondary">{fundraiser.status}</Badge>
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

				<div className="space-x-2 my-4 ">
					{fundraiserTeams.map((team) => (
						<Badge key={team.id}>{team.name}</Badge>
					))}
				</div>
				<div className="my-4 flex gap-6 text-sm items-center">
					<AvatarGroup className="grayscale">
						{participants.map((participant) => (
							<Avatar key={participant.id}>
								<AvatarImage
									src={participant.imageUrl}
									alt={participant.firstName}
								/>
								<AvatarFallback>AA</AvatarFallback>
							</Avatar>
						))}

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
						{/* <AvatarGroupCount>
                    <PlusIcon />
                </AvatarGroupCount> */}
					</AvatarGroup>
				</div>
				<Badge variant="secondary">Manage Participants</Badge>
			</CardContent>
		</Card>
	);
}
