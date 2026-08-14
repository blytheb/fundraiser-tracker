import AllPlayersLayout from "@/components/players/AllPlayersLayout";
import { getAllPlayers, getPlayersWithTeams } from "@/lib/data/players";

export default async function AllPlayersPage() {
	const players = await getPlayersWithTeams();

	return (
		<>
			<AllPlayersLayout initialPlayers={players} />
		</>
	);
}
