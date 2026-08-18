// import { mockFundraisers } from "@/lib/mock-data/fundraisers";
// import { mockTeamFundraisers } from "@/lib/mock-data/team-fundraisers";

// export function getFundraisersByTeamId(teamId: string) {
// 	const fundraiserMemberships = mockTeamFundraisers.filter(
// 		(teamFundraiser) => teamFundraiser.teamId === teamId,
// 	);

// 	return fundraiserMemberships
// 		.map((membership) =>
// 			mockFundraisers.find(
// 				(fundraiser) => fundraiser.id === membership.fundraiserId,
// 			),
// 		)
// 		.filter(Boolean);
// }

import { prisma } from "@/lib/prisma";

export function getAllFundraisers() {
	return prisma.fundraiser.findMany({
		orderBy: {
			name: "asc",
		},
	});
}
