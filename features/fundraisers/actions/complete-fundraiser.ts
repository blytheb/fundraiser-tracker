//when does the fundraiser become official
"use server";

import { prisma } from "@/lib/prisma";

//draft to complete status
export async function completeFundraiser(fundraiserId: string) {
	return prisma.$transaction(async (tx) => {
		const fundraiser = await tx.fundraiser.findUnique({
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

		if (!fundraiser) {
			throw new Error("Fundraiser not found");
		}

		if (fundraiser.status !== "DRAFT") {
			throw new Error("Only draft fundraisers can be completed.");
		}

		if (
			fundraiser.participants.some(
				(participant) => participant.allocations.length > 1,
			)
		) {
			throw new Error(
				"Each participant can have at most one active allocation before completing",
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

		const totalRaised = Number(contributions._sum.amount ?? 0);
		const currentlyAllocated = Number(allocations._sum.amount ?? 0);

		if (currentlyAllocated > totalRaised) {
			throw new Error("Allocated funds cannot exceed funds raised");
		}

		const availableToAllocate = totalRaised - currentlyAllocated;

		if (availableToAllocate > 0) {
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
				description: "Fundraiser distribution",
			}));

		if (distributions.length > 0) {
			await tx.playerTransaction.createMany({
				data: distributions,
			});
		}

		return tx.fundraiser.update({
			where: { id: fundraiserId },
			data: { status: "COMPLETED" },
		});
	});
}
