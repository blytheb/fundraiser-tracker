//when does the fundraiser become official
"use server";

import { prisma } from "@/lib/prisma";

export async function publishFundraiser(fundraiserId: string) {
	return prisma.$transaction(async (tx) => {
		const fundraiser = await tx.fundraiser.findUnique({
			where: {
				id: fundraiserId,
			},
			include: {
				participants: true,
			},
		});

		if (!fundraiser) {
			throw new Error("Fundraiser not found");
		}

		if (fundraiser.status !== "DRAFT") {
			throw new Error("Only draft fundraisers can be published");
		}

		if (fundraiser.participants.length === 0) {
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

export async function unpublishFundraiser(fundraiserId: string) {
	return prisma.$transaction(async (tx) => {
		const fundraiser = await tx.fundraiser.findUnique({
			where: {
				id: fundraiserId,
			},
		});
		if (!fundraiser) {
			throw new Error("Fundraiser not found");
		}

		if (fundraiser.status !== "PUBLISHED") {
			throw new Error("Only published fundraisers can be unpublished");
		}

		await tx.allocation.updateMany({
			where: {
				fundraiserParticipant: {
					fundraiserId,
				},
				status: "ACTIVE",
			},
			data: {
				status: "VOID",
			},
		});

		await tx.fundraiser.update({
			where: {
				id: fundraiserId,
			},
			data: {
				status: "DRAFT",
			},
		});

		return {
			success: true,
		};
	});
}

export async function completeFundraiser(fundraiserId: string) {
	const fundraiser = await prisma.fundraiser.findUnique({
		where: { id: fundraiserId },
	});

	if (!fundraiser) {
		throw new Error("Fundraiser not found");
	}

	if (fundraiser.status !== "PUBLISHED") {
		throw new Error("Only published fundraisers can be completed");
	}

	return prisma.fundraiser.update({
		where: { id: fundraiserId },
		data: { status: "COMPLETED" },
	});
}
