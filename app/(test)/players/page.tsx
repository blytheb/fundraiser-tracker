import AllPlayersLayout from "@/components/players/AllPlayersLayout";
import { getAllPlayers, getPlayersWithTeams } from "@/lib/data/players";

import PageHeader from "@/components/PageHeader";
import SearchBar from "@/components/SearchBar";
import ListItemWithAvatar from "@/components/ListItemWithAvatar";
import AddPlayerDialog from "@/components/players/forms/AddPlayerDialog";
import { ItemGroup } from "@/components/ui/item";

export default async function AllPlayersPage() {
	const players = await getAllPlayers();

	return (
		<div className="space-y-4 px-4">
			<PageHeader heading="Players" />
			<div className="flex gap-4">
				<SearchBar />
				<AddPlayerDialog />
			</div>
			<div className="space-y-2">
				{players.length === 0 ? (
					<div className="flex flex-col w-full items-center gap-3 rounded-lg border p-3">
						No Players Found
					</div>
				) : (
					<div className="space-y-4">
						<ItemGroup>
							{players.map((player) => (
								<ListItemWithAvatar key={player.id} player={player} />
							))}
						</ItemGroup>
					</div>
				)}
			</div>
		</div>
	);
}
