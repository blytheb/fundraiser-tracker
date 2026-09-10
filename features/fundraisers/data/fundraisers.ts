import { prisma } from "@/lib/prisma";
import type { Fundraiser } from "@prisma/client";

//get All fundraisers
export async function getFundraisers(search?: string): Promise<Fundraiser[]> {
	return await prisma.fundraiser.findMany({
		where: search
			? {
					name: {
						contains: search,
						mode: "insensitive",
					},
				}
			: undefined,

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
	return await prisma.fundraiser.findUnique({
		where: {
			id,
		},
	});
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
