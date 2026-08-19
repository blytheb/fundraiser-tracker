import { prisma } from "@/lib/prisma";

export async function getAllFundraisers() {
	return prisma.fundraiser.findMany({
		orderBy: {
			name: "asc",
		},
	});
}

export async function getFundraiserById(id: string) {
	return prisma.fundraiser.findUnique({
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
}
