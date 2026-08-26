import { prisma } from "@/lib/prisma";
import type { Fundraiser } from "@/prisma/client";

//get All fundraisers
export async function getFundraisers(): Promise<Fundraiser[]> {
	return await prisma.fundraiser.findMany({
		orderBy: {
			startDate: "desc",
		},
	});
}

export async function getActiveFundraisers(): Promise<Fundraiser[]> {
	return prisma.fundraiser.findMany({
		where: {
			status: "ACTIVE",
		},
		orderBy: {
			startDate: "desc",
		},
	});
}

//get One fundraiser
export async function getFundraiserById(
	id: string,
): Promise<Fundraiser | null> {
	return (fundraiser = await prisma.fundraiser.findUnique({
		where: {
			id,
		},
	}));
}

export async function getFundraiserWithTeams(
	id: string,
): Promise<FundraiserWithTeams | null> {
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
		},
	});
}

export async function getFundraiserWithParticipants(
	id: string,
): Promise<FundraiserWithParticipants | null> {
	return prisma.fundraiser.findUnique({
		where: {
			id,
		},
		include: {
			fundraiserParticipants: {
				include: {
					player: true,
				},
			},
		},
	});
}
