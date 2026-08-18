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

import TeamActions from "@/components/teams/TeamActions";

import type { Team } from "@/types/team";
type TeamCardProps = {
	team: Team;
};

export default function TeamCard({ team }: TeamCardProps) {
	return (
		<Card className="flex h-[250px] w-full flex-col overflow-hidden pt-0">
			<div className="relative aspect-video w-full">
				<div className="absolute inset-0 z-30 aspect-video bg-black/35" />
				{/* <Image
					src={team.imageUrl}
					loading="eager"
					alt={`${team.name} team`}
					width={500}
					height={300}
					className="relative z-20 aspect-video w-full object-cover brightness-60 grayscale dark:brightness-40"
				/> */}
				{team.imageUrl ? (
					<Image
						src={team.imageUrl ?? "https://robohash.org/1?set=set2"}
						alt={`${team.name} team`}
						fill
						className="object-cover"
					/>
				) : (
					<div className="flex h-full items-center justify-center">
						No team image
					</div>
				)}
			</div>

			<CardHeader>
				<CardAction>
					<TeamActions team={team} />
				</CardAction>
				<Badge variant="secondary" className="bg-green-300">
					{team.status}
				</Badge>
				<CardTitle>{team.name}</CardTitle>
			</CardHeader>
			<CardFooter>
				<Button className="w-full">
					<Link href={`/teams/${team.id}`}>View Team</Link>
				</Button>
			</CardFooter>
		</Card>
	);
}
