import React from "react";
import { mockTeams } from "@/lib/mock-data/teams";


type TeamPageProps = {
	params: Promise<{
		fundraiserId: string;
	}>;
};

export default async function TeamPage({ params }: TeamPageProps) {
	const { teamId } = await params;
    const team = mockTeams.find(
			(team) => team.id === teamId,
		);

	if (!team) {
		return <div>Team Not Found</div>;
	}

	return (
		<div className="p-6">
			<div className="mb-6 flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-bold">{team.name}</h1>
					<p className="text-muted-foreground">{team.season} Season</p>
				</div>
			</div>

			<div className="rounded-lg border">
				<div className="p-6 text-center text-muted-foreground">
					No seasons have been created yet.
				</div>
			</div>
		</div>
	);
}
