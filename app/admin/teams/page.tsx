import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import PageHeader from "@/components/reusable/PageHeader";
import TeamList from "@/features/teams/TeamList";
import AddTeamDialog from "@/components/forms/teams/AddTeamDialog";
import SearchBar from "@/components/reusable/SearchBar";

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
		redirect("/parent/my-players");
	}
	const { search } = await searchParams;
	const teams = await getTeams(search);

	return (
		<main className="mx-auto w-full max-w-4xl space-y-4 px-4 py-2 sm:px-6 lg:px-10">
			<PageHeader
				heading="Teams"
				subheading="All Menehune Teams"
				action={<AddTeamDialog />}
			/>

			<SearchBar paramName="search" placeholder="Search teams..." />

			<TeamList teams={teams} />
		</main>
	);
}
