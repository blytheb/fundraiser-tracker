import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/permissions";

// One team transaction for its detail and edit pages, with amounts as numbers.
export async function getTeamTransaction(id: string) {
	await requireAdmin();

	const teamTransaction = await prisma.teamTransaction.findUnique({
		where: { id },
		include: {
			items: { orderBy: { date: "asc" } },
			teams: { include: { team: { select: { id: true, name: true } } } },
			participants: {
				include: {
					player: { select: { id: true, firstName: true, lastName: true } },
					shares: { where: { status: "ACTIVE" } },
				},
				orderBy: [{ player: { lastName: "asc" } }, { player: { firstName: "asc" } }],
			},
			_count: { select: { playerTransactions: true } },
		},
	});

	if (!teamTransaction) {
		return null;
	}

	const zero = new Prisma.Decimal(0);
	const total = Prisma.Decimal.sum(zero, ...teamTransaction.items.map((i) => i.amount));
	const shared = Prisma.Decimal.sum(
		zero,
		...teamTransaction.participants.map((p) => p.shares[0]?.amount ?? zero),
	);

	return {
		id: teamTransaction.id,
		name: teamTransaction.name,
		description: teamTransaction.description,
		date: teamTransaction.date,
		direction: teamTransaction.direction,
		status: teamTransaction.status,
		paymentMethod: teamTransaction.items[0]?.paymentMethod ?? "CASH",
		total: total.toNumber(),
		shared: shared.toNumber(),
		teams: teamTransaction.teams.map((t) => t.team),
		shares: teamTransaction.participants.map((p) => ({
			playerId: p.player.id,
			name: `${p.player.firstName} ${p.player.lastName}`,
			amount: (p.shares[0]?.amount ?? zero).toNumber(),
		})),
		// true once it has been completed at least once (even if reopened)
		hasHistory: teamTransaction._count.playerTransactions > 0,
	};
}

export type TeamTransactionDetail = NonNullable<
	Awaited<ReturnType<typeof getTeamTransaction>>
>;
