import { prisma } from "@/lib/prisma";

export function getAllFundraisers() {
	return prisma.fundraiser.findMany({
		orderBy: {
			name: "asc",
		},
	});
}

export function getFundraiserById(id: string) {
	return prisma.fundraiser.findUnique({
		where: {
			id,
		},
	});
}
