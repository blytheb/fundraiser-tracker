"use server";

import { prisma } from "@/lib/prisma";

export async function removeTeamFromFundraiser(
	fundraiserId: string,
	teamId: string,
) {
	const fundraiser = await prisma.fundraiser.findUnique({
		where: { id: fundraiserId },
		select: { status: true },
	});

	if (!fundraiser) {
		throw new Error("Fundraiser not found");
	}

	if (fundraiser.status !== "DRAFT") {
		throw new Error("Completed fundraisers cannot be edited.");
	}

	return prisma.fundraiserTeam.delete({
		where: {
			fundraiserId_teamId: { fundraiserId, teamId },
		},
	});
}
