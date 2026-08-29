import PageHeader from "@/components/ui-reusable/PageHeader";
import SearchBar from "@/components/ui-reusable/SearchBar";
import AddPlayerDialog from "@/components/forms/players/AddPlayerDialog";
import PlayerList from "@/features/players/PlayerList";

import { getPlayers } from "@/features/players/data/players";

type PageProps = {
	searchParams: Promise<{
		search?: string;
	}>;
};

export default async function AllPlayersPage({ searchParams }: PageProps) {
	const { search } = await searchParams;
	const players = await getPlayers(search);

	return (
		<div className="space-y-4 px-4">
			<PageHeader heading="Players" />
			<div className="flex gap-4">
				<SearchBar />
				<AddPlayerDialog />
			</div>
			<PlayerList players={players} />
		</div>
	);
}
