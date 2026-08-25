import PageHeader from "@/components/PageHeader";
import ListItemWithImage from "@/components/ListItemWithImage";
import AddTeamDialog from "@/components/teams/forms/AddTeamDialog";

import { ItemGroup } from "@/components/ui/item";

import { getAllTeams } from "@/lib/data/teams";

export default async function AllTeamsPage() {
	const teams = await getAllTeams();

	return (
		<div className="mx-auto w-full max-w-7xl space-y-6 px-4 sm:px-6 lg:px-8">
			<PageHeader heading="Teams" subheading="All Menehune Teams" />
			{teams.length === 0 ? (
				<div>
					<AddTeamDialog />
					<div className="rounded-lg border">
						<div className="p-6 text-center text-muted-foreground">
							No seasons have been created yet.
						</div>
					</div>
				</div>
			) : (
				<div className="grid grid-cols-1 gap-4 items-stretch sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 ">
					<ItemGroup>
						{teams.map((team) => (
							// <TeamCard key={team.id} team={team} />
							<ListItemWithImage key={team.id} team={team} />
						))}
					</ItemGroup>
					<AddTeamDialog />
				</div>
			)}
		</div>
	);
}
