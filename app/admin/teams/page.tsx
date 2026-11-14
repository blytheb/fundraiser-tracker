import PageHeader from "@/components/reusable/PageHeader";
import TeamList from "@/features/teams/TeamList";
import AddTeamDialog from "@/components/forms/teams/AddTeamDialog";
import SearchBar from "@/components/reusable/SearchBar";

import { getTeams } from "@/features/teams/data/teams";
import { getActivePlayerOptions } from "@/features/players/data/players";

type PageProps = {
	searchParams: Promise<{ search?: string }>;
};

export default async function AllTeamsPage({ searchParams }: PageProps) {
	const { search } = await searchParams;
	const [teams, players] = await Promise.all([
		getTeams(search),
		getActivePlayerOptions(),
	]);

	return (
		<main className="mx-auto w-full max-w-4xl space-y-4 px-4 py-2 sm:px-6 lg:px-10">
			<PageHeader
				heading="Teams"
				subheading="All Menehune Teams"
				action={<AddTeamDialog players={players} />}
			/>

			<SearchBar paramName="search" placeholder="Search teams..." />

			<TeamList teams={teams} />
		</main>
	);
}
