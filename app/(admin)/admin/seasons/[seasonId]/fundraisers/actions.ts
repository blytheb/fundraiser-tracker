"use server";

import { prisma } from "@/lib/prisma";

export async function createFundraiser(
	seasonId: string,
	name: string,
	description: string,
	fundraiserDate: string,
	notes: string,
	status: "DRAFT" | "ACTIVE" | "COMPLETED",
	distributionMethod: "EQUAL" | "CUSTOM",
) {
	const fundraiser = await prisma.fundraiser.create({
		data: {
			seasonId,
			name,
			description: description || null,
			fundraiserDate: new Date(fundraiserDate) || new Date(Today()),
			notes: notes || null,
			status,
			distributionMethod,
		},
	});

	return fundraiser;
}
