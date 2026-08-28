import React from "react";

import ManageFundraiserTeamsDialog from "@/components/fundraisers/forms/ManageFundraiserTeamsDialog";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";

import type { Fundraiser } from "@/types/fundraisers";
import type { Team } from "@/types/teams";

type CardProps = {
	fundraiserId: string;
	selectedTeams: Team[];
	activeTeams: Team[];
};

export default function FundraiserTeamsCard({
	fundraiserId,
	selectedTeams,
	activeTeams,
}: CardProps) {
	return (
		<Card>
			<CardHeader className="flex flex-row items-center justify-between">
				<div>
					<CardTitle className="flex items-center gap-2">
						<Users className="h-5 w-5" />
						Teams
					</CardTitle>

					<p className="text-sm text-muted-foreground">
						{selectedTeams.length} teams participating
					</p>
				</div>

				<ManageFundraiserTeamsDialog
					fundraiserId={fundraiserId}
					selectedTeams={selectedTeams}
					activeTeams={activeTeams}
				/>
			</CardHeader>

			<CardContent>
				{selectedTeams.length === 0 ? (
					<div className="rounded-lg border border-dashed p-8 text-center">
						<p className="text-sm font-medium">No teams added</p>
						<p className="mt-1 text-sm text-muted-foreground">
							Add teams to this fundraiser to get started.
						</p>
					</div>
				) : (
					<div className="grid gap-3 sm:grid-cols-2">
						{selectedTeams.map((team) => (
							<div key={team.id} className="rounded-lg border p-4">
								<p className="font-medium">{team.name}</p>
								<p className="text-xs text-muted-foreground">Active team</p>
							</div>
						))}
					</div>
				)}
			</CardContent>
		</Card>
	);
}
