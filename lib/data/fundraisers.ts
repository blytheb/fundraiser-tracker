import { prisma } from "@/lib/prisma";

export async function getAllFundraisers() {
	const fundraisers = await prisma.fundraiser.findMany({
		orderBy: {
			name: "asc",
		},
	});

	return fundraisers.map((fundraiser) => ({
		...fundraiser,
		totalAmount: fundraiser.totalAmount.toNumber(),
	}));
}

export async function getFundraiserById(id: string) {
	const fundraiser = await prisma.fundraiser.findUnique({
		where: {
			id,
		},

		include: {
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

	return {
		...fundraiser,
		totalAmount: fundraiser.totalAmount.toNumber(),
	};
}
