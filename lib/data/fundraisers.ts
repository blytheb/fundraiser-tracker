import { mockFundraisers } from "@/lib/mock-data/fundraisers";
import { mockTeamFundraisers } from "@/lib/mock-data/fundraisers-team";
import { mockTeams } from "@/lib/mock-data/teams";

const useDatabase = process.env.USE_DATABASE === "true";

export function getAllFundraisers() {
	return mockFundraisers;
}

//Give me every fundraisers along with the teams they belong to
export function getFundraisersWithTeams() {
	if (!useDatabase) {
		return mockFundraisers.map((fundraiser) => {
			const teamMemberships = mockTeamFundraisers.filter(
				(teamFundraiser) => teamFundraiser.fundraiserId === fundraiser.id,
			);

			const teams = teamMemberships
				.map((membership) =>
					mockTeams.find((team) => team.id === membership.teamId),
				)
				.filter(Boolean);

			return {
				...fundraiser,
				teams,
			};
		});
	}
}

export function getFundraisersByTeamId(teamId: string) {
	const fundraiserMemberships = mockTeamFundraisers.filter(
		(teamFundraiser) => teamFundraiser.teamId === teamId,
	);

	return fundraiserMemberships
		.map((membership) =>
			mockFundraisers.find(
				(fundraiser) => fundraiser.id === membership.fundraiserId,
			),
		)
		.filter(Boolean);
}
