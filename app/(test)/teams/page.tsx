import PageHeader from "@/components/PageHeader";
import TeamCard from "@/components/teams/TeamCard";
import AddTeamDialog from "@/components/teams/forms/AddTeamDialog";

import { getAllTeams } from "@/lib/data/teams";

export default async function AllTeamsPage() {
	const teams = await getAllTeams();

	return (
		<div className="mx-auto w-full max-w-7xl space-y-6 px-4 sm:px-6 lg:px-8">
			<PageHeader heading="Teams" subheading="All Menehune Teams" />
			{teams.length === 0 ? (
				<div>
					<div className="rounded-lg border">
						<div className="p-6 text-center text-muted-foreground">
							No seasons have been created yet.
						</div>
					</div>
					<AddTeamDialog />
				</div>
			) : (
				<div className="grid grid-cols-1 gap-4 items-stretch sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 ">
					{teams.map((team) => (
						<TeamCard key={team.id} team={team} />
					))}
					<AddTeamDialog />
				</div>
			)}
		</div>
	);
}
