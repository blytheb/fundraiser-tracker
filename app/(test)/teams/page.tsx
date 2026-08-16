import AllTeamsLayout from "@/components/teams/AllTeamsLayout";
import { getAllTeams } from "@/lib/data/teams";

export default async function AllTeamsPage() {
	const teams = await getAllTeams();

	return (
		<>
			<AllTeamsLayout teams={teams} />
		</>
	);
}
