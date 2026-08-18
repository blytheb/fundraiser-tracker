import AllPlayersLayout from "@/components/players/AllPlayersLayout";
import { getAllPlayers, getPlayersWithTeams } from "@/lib/data/players";

export default async function AllPlayersPage() {
	const players = await getAllPlayers();

	return (
		<>
			<AllPlayersLayout players={players} />
		</>
	);
}
