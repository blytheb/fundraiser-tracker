import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import PageHeader from "@/components/ui-reusable/PageHeader";
import TeamList from "@/features/teams/TeamList";
import AddTeamDialog from "@/components/forms/teams/AddTeamDialog";
import SearchBar from "@/components/ui-reusable/SearchBar";

import { getTeams } from "@/features/teams/data/teams";

type PageProps = {
	searchParams: Promise<{ search?: string }>;
};

export default async function AllTeamsPage({ searchParams }: PageProps) {
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	if (!session?.user) {
		redirect("/");
	}

	if (session.user.role !== "ADMIN") {
		redirect("/my-players");
	}
	const { search } = await searchParams;
	const teams = await getTeams(search);

	return (
		<main className="mx-auto w-full max-w-5xl space-y-4 px-4 py-2 sm:px-6 lg:py-10">
			<PageHeader heading="Teams" subheading="All Menehune Teams" />
			<div className="flex items-center gap-3">
				<div className="min-w-0 flex-1">
					<SearchBar paramName="search" placeholder="Search teams..." />
				</div>
				<AddTeamDialog />
			</div>

			<TeamList teams={teams} />
		</main>
	);
}
