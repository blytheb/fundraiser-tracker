//when does the fundraiser become official
"use server";

import { runAction } from "@/lib/action-result";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/permissions";
import { claimStatus } from "@/features/fundraisers/lib/fundraiser-status";

//draft to complete status: locks numbers and creates internal distributions
export async function completeFundraiser(fundraiserId: string) {
	return runAction(async () => {
		await requireAdmin();

		return prisma.$transaction(async (tx) => {
			//claim status change first. This locks the row so double click or retry cant create a second distribution
			await claimStatus(tx, fundraiserId, { from: "DRAFT", to: "COMPLETED", action: "completed" });

			//any error thrown below rolls the status back to DRAFT automatically
			const participantsWithoutAllocation =
				await tx.fundraiserParticipant.findMany({
					where: {
						fundraiserId,
						allocations: { none: { status: "ACTIVE" } },
					},
					select: { id: true },
				});

			//every participant needs an allocation: anyone left blank gets $0
			if (participantsWithoutAllocation.length > 0) {
				await tx.fundraiserAllocation.createMany({
					data: participantsWithoutAllocation.map((p) => ({
						fundraiserParticipantId: p.id,
						amount: new Prisma.Decimal(0),
						status: "ACTIVE" as const,
					})),
				});
			}

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

			if (fundraiser.participants.some((p) => p.allocations.length !== 1)) {
				throw new Error(
					"Each participant must have exactly one allocation before completing",
				);
			}

			const contributions = await tx.fundraiserContribution.aggregate({
				where: { fundraiserId },
				_sum: { amount: true },
			});

			const totalRaised = contributions._sum.amount ?? new Prisma.Decimal(0);
			const allocated = Prisma.Decimal.sum(
				new Prisma.Decimal(0),
				...fundraiser.participants.map((p) => p.allocations[0].amount),
			);

			if (!allocated.equals(totalRaised)) {
				throw new Error(
					`All funds must be allocated before completing. Allocated ${allocated.toFixed(2)} of ${totalRaised.toFixed(2)}`,
				);
			}

			const distributions = fundraiser.participants.map((participant) => ({
				playerId: participant.playerId,
				fundraiserId: fundraiser.id,
				allocationId: participant.allocations[0].id,
				amount: participant.allocations[0].amount,
				type: "DISTRIBUTION" as const,
				direction: "INCOME" as const,
				status: "INTERNAL" as const, //admin only until published
				description: "Fundraiser distribution",
			}));

			if (distributions.length > 0) {
				await tx.playerTransaction.createMany({
					data: distributions,
				});
			}

			//return only plain values: Prisma.Decimal amounts can't be sent to the client
			return { id: fundraiser.id, status: "COMPLETED" as const };
		});
	});
}
