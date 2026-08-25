import PageHeader from "@/components/PageHeader";
import SearchBar from "@/components/SearchBar";
import AddPlayerDialog from "@/features/players/forms/AddPlayerDialog";
import PlayerList from "@/features/players/PlayerList";

import { getPlayers } from "@/features/players/data/players";

export default async function AllPlayersPage() {
	const players = await getPlayers();

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
