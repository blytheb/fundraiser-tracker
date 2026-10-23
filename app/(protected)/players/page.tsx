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
		redirect("/my-players");
	}

	const { search } = await searchParams;
	const players = await getPlayers(search);

	return (
		<main className="mx-auto w-full max-w-5xl space-y-4 px-4 py-2 sm:px-6 lg:py-10">
			<PageHeader heading="Players" />

			<div className="flex items-center gap-3">
				<div className="min-w-0 flex-1">
					<SearchBar placeholder="Search players..." />
				</div>
				<AddPlayerDialog />
			</div>

			<PlayerList players={players} />
		</main>
	);
}
