//when does the fundraiser become official
"use server";

import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/permissions";

//draft to complete status: locks numbers and creates internal distributions
export async function completeFundraiser(fundraiserId: string) {
	await requireAdmin();

	return prisma.$transaction(async (tx) => {
		//claim status change first. This locks the row so double click or retry cant create a second distribution
		const claimed = await tx.fundraiser.updateMany({
			where: { id: fundraiserId, status: "DRAFT" },
			data: { status: "COMPLETED" },
		});

		if (claimed.count === 0) {
			const exists = await tx.fundraiser.findUnique({
				where: { id: fundraiserId },
				select: { id: true, status: true },
			});

			throw new Error(
				exists
					? `Fundraiser is already ${exists.status.toLowerCase()}`
					: "Fundraiser not found",
			);
		}

		//any error thrown below rolls the status back to DRAFT automatically
		const fundraiser = await tx.fundraiser.findUniqueOrThrow({
			where: { id: fundraiserId },
			include: {
				participants: {
					include: {
						allocations: {
							where: {
								status: "ACTIVE",
							},
						},
					},
				},
			},
		});

		if (fundraiser.participants.length === 0) {
			throw new Error("A fundraiser must have at least one participant");
		}

		if (fundraiser.participants.some((p) => p.allocations.length === 0)) {
			throw new Error(
				"Each participant must have one allocation before completing",
			);
		}

		const [contributions, allocations] = await Promise.all([
			tx.fundraiserContribution.aggregate({
				where: { fundraiserId },
				_sum: { amount: true },
			}),
			tx.fundraiserAllocation.aggregate({
				where: {
					fundraiserParticipant: { fundraiserId },
					status: "ACTIVE",
				},
				_sum: { amount: true },
			}),
		]);

		const totalRaised = contributions._sum.amount ?? new Prisma.Decimal(0);
		const allocated = allocations._sum.amount ?? new Prisma.Decimal(0);

		if (allocated.greaterThan(totalRaised)) {
			throw new Error("Allocated funds cannot exceed funds raised");
		}

		if (!allocated.equals(totalRaised)) {
			throw new Error("All funds must be allocated before completing");
		}

		const distributions = fundraiser.participants
			.filter((participant) => participant.allocations.length === 1)
			.map((participant) => ({
				playerId: participant.playerId,
				fundraiserId: fundraiser.id,
				allocationId: participant.allocations[0].id,
				amount: participant.allocations[0].amount,
				type: "DISTRIBUTION" as const,
				status: "INTERNAL" as const, //admin only until published
				description: "Fundraiser distribution",
			}));

		if (distributions.length > 0) {
			await tx.playerTransaction.createMany({
				data: distributions,
			});
		}

		return fundraiser;
	});
}
