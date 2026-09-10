import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardAction,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import Image from "next/image";

import TeamActions from "@/features/teams/TeamActions";

import type { Team } from "@prisma/client";

type TeamCardProps = {
	team: Team;
};

export default function TeamCard({ team }: TeamCardProps) {
	return (
		<Card className="w-full overflow-hidden pt-0">
			{/* image */}
			<div className="relative aspect-video w-full overflow-hidden">
				{team.imageUrl ? (
					<>
						<Image
							src={team.imageUrl ?? "https://robohash.org/1?set=set2"}
							alt={`${team.name} team`}
							fill
							sizes="(max-width:640px) 100vw, (max-width:1024px) 50vw, 25vw"
							className="object-cover"
						/>
						<div className="absolute inset-0 bg-black/20" />
					</>
				) : (
					<div className="flex h-full items-center justify-center bg-muted text-sm text-muted-foreground">
						No team image
					</div>
				)}
			</div>
			{/* Team Information */}
			<CardHeader className="relative">
				<CardAction>
					<TeamActions team={team} />
				</CardAction>
				<Badge variant="secondary" className="bg-green-300">
					{team.status}
				</Badge>
				<CardTitle className="truncate text-lg sm:text-xl">
					{team.name}
				</CardTitle>
			</CardHeader>

			{/* Action */}
			<CardFooter>
				<Button className="w-full">
					<Link href={`/teams/${team.id}`}>View Team</Link>
				</Button>
			</CardFooter>
		</Card>
	);
}
