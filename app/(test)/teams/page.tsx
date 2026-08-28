import PageHeader from "@/components/ui-reusable/PageHeader";
import TeamList from "@/features/teams/TeamList";

import { getTeams } from "@/features/teams/data/teams";

export default async function AllTeamsPage() {
	const teams = await getTeams();

	return (
		<div className="mx-auto w-full max-w-7xl space-y-6 px-4 sm:px-6 lg:px-8">
			<PageHeader heading="Teams" subheading="All Menehune Teams" />
			<TeamList teams={teams} />
		</div>
	);
}
