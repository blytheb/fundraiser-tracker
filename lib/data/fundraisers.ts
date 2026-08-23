import { prisma } from "@/lib/prisma";

export async function getAllFundraisers() {
	return (fundraisers = await prisma.fundraiser.findMany({
		orderBy: {
			name: "asc",
		},
	}));
}

export async function getFundraiserById(id: string) {
	const fundraiser = await prisma.fundraiser.findUnique({
		where: {
			id,
		},

		include: {
			funds: true,
			teams: {
				include: {
					team: true,
				},
			},
			participants: {
				include: {
					player: true,
				},
			},
		},
	});

	if (!fundraiser) {
		return null;
	}

	return fundraiser;
}
