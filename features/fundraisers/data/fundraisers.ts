import { prisma } from "@/lib/prisma";
import type { Fundraiser } from "@prisma/client";
import type {
	FundraiserWithTeams,
	FundraiserWithParticipants,
} from "@/features/fundraisers/types";
import { requireUser } from "@/lib/permissions";

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

export async function getInCompleteFundraisers(): Promise<Fundraiser[]> {
	return prisma.fundraiser.findMany({
		where: {
			isCompleted: false,
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
			participants: {
				include: {
					player: true,
				},
			},
		},
	});
}

export async function getPublishedFundraisersByPlayer(playerId: string) {
	const user = await requireUser();

	if (user.role === "PARENT") {
		const link = await prisma.parentPlayerLink.findUnique({
			where: {
				userId_playerId: {
					userId: user.id,
					playerId,
				},
			},
			select: { id: true },
		});

		if (!link) {
			throw new Error("You do not have access to this player.");
		}
	}
	return await prisma.fundraiser.findMany({
		where: {
			isPublished: true,
			participants: {
				some: {
					playerId,
				},
			},
		},
		include: {
			transactions: {
				where: {
					playerId,
					status: "ACTIVE",
					type: "DISTRIBUTION",
				},
				orderBy: {
					date: "desc",
				},
			},
		},
		orderBy: {
			createdAt: "desc",
		},
	});
}
