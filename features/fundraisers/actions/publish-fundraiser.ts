//when does the fundraiser become official
"use server";

import { prisma } from "@/lib/prisma";

// completed to published status
export async function publishFundraiser(fundraiserId: string) {
	return prisma.$transaction(async (tx) => {
		const fundraiser = await tx.fundraiser.findUnique({
			where: {
				id: fundraiserId,
			},
			select: {
				status: true,
				_count: {
					select: {
						participants: true,
					},
				},
			},
		});

		if (!fundraiser) {
			throw new Error("Fundraiser not found");
		}

		if (fundraiser.status === "PUBLISHED") {
			throw new Error("Fundraiser is already published");
		}

		if (fundraiser.status !== "COMPLETED") {
			throw new Error(
				"A fundraiser must be completed before it can be published",
			);
		}

		if (fundraiser._count.participants === 0) {
			throw new Error("A fundraiser must have at least one participant");
		}

		await tx.fundraiser.update({
			where: {
				id: fundraiserId,
			},
			data: {
				status: "PUBLISHED",
			},
		});

		return {
			success: true,
		};
	});
}
