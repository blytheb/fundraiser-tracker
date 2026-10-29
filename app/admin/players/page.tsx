import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import PageHeader from "@/components/reusable/PageHeader";
import SearchBar from "@/components/reusable/SearchBar";
import AddPlayerDialog from "@/components/forms/players/AddPlayerDialog";
import PlayerList from "@/features/players/PlayerList";
import { getPlayers } from "@/features/players/data/players";

type PageProps = {
	searchParams: Promise<{
		search?: string;
	}>;
};

export default async function AllPlayersPage({ searchParams }: PageProps) {
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
	const players = await getPlayers(search);

	return (
		<main className="mx-auto w-full max-w-4xl space-y-4 p-6 sm:px-6 lg:px-10">
			<PageHeader heading="Players" action={<AddPlayerDialog />} />

			<SearchBar placeholder="Search players..." />

			<PlayerList players={players} />
		</main>
	);
}
