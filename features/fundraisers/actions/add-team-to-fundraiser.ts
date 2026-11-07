"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/permissions";

export async function addTeamToFundraiser(
	fundraiserId: string,
	teamId: string,
) {
	await requireAdmin();

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

	return prisma.fundraiserTeam.create({
		data: { fundraiserId, teamId },
	});
}
