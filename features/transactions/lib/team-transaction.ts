import { Prisma } from "@prisma/client";
import type { TeamTransactionStatus } from "@prisma/client";

// Shared rules for team transactions. Call these with the transaction client (tx)
// inside prisma.$transaction: the status helpers lock the row until it ends.

type Tx = Prisma.TransactionClient;

const STATUS_PHRASES: Record<TeamTransactionStatus, string> = {
	DRAFT: "a draft",
	COMPLETED: "final",
	PUBLISHED: "shared with parents",
	VOIDED: "deleted",
};

const STATUS_ADJECTIVES: Record<TeamTransactionStatus, string> = {
	DRAFT: "draft",
	COMPLETED: "final",
	PUBLISHED: "shared",
	VOIDED: "deleted",
};

async function throwStatusError(
	tx: Tx,
	id: string,
	allowed: TeamTransactionStatus[],
	action: string,
): Promise<never> {
	const current = await tx.teamTransaction.findUnique({
		where: { id },
		select: { status: true },
	});

	if (!current) {
		throw new Error("Team transaction not found");
	}

	const words = allowed.map((s) => STATUS_ADJECTIVES[s]);
	// "final", "final or shared", "draft, final or shared"
	const allowedList =
		words.length > 1 ? `${words.slice(0, -1).join(", ")} or ${words.at(-1)}` : words[0];
	throw new Error(
		`Only ${allowedList} team transactions can be ${action}. This one is ${STATUS_PHRASES[current.status]}.`,
	);
}

/** Throws unless the team transaction exists and is a DRAFT. Locks the row. */
export async function assertTeamDraft(tx: Tx, id: string, action = "edited") {
	const locked = await tx.teamTransaction.updateMany({
		where: { id, status: "DRAFT" },
		data: { updatedAt: new Date() },
	});

	if (locked.count === 0) {
		await throwStatusError(tx, id, ["DRAFT"], action);
	}
}

/** Moves the team transaction from one of `from` to `to`, or throws a readable error. */
export async function claimTeamStatus(
	tx: Tx,
	id: string,
	{
		from,
		to,
		action,
	}: {
		from: TeamTransactionStatus | TeamTransactionStatus[];
		to: TeamTransactionStatus;
		action: string;
	},
) {
	const allowed = Array.isArray(from) ? from : [from];
	const claimed = await tx.teamTransaction.updateMany({
		where: { id, status: { in: allowed } },
		data: { status: to },
	});

	if (claimed.count === 0) {
		await throwStatusError(tx, id, allowed, action);
	}
}

/**
 * Parses a money amount from the client into a Decimal rounded to cents.
 * Throws a readable error for non-numbers and (unless allowZero) amounts ≤ 0.
 */
export function parseMoney(
	value: number,
	label: string,
	{ allowZero = false }: { allowZero?: boolean } = {},
) {
	if (!Number.isFinite(value)) {
		throw new Error(`${label} must be a valid number.`);
	}

	const amount = new Prisma.Decimal(value).toDecimalPlaces(
		2,
		Prisma.Decimal.ROUND_HALF_UP,
	);

	if (amount.isNegative() || (!allowZero && amount.isZero())) {
		throw new Error(
			allowZero
				? `${label} can't be negative.`
				: `${label} must be greater than $0.`,
		);
	}

	return amount;
}

/**
 * Called after claiming DRAFT → COMPLETED: checks the shares add up to the items
 * and writes one INTERNAL ledger row per active share (including $0 shares).
 * Throwing here rolls the status back to DRAFT.
 */
export async function writeTeamLedgerRows(tx: Tx, id: string) {
	const teamTransaction = await tx.teamTransaction.findUniqueOrThrow({
		where: { id },
		include: {
			items: { select: { amount: true } },
			participants: {
				include: { shares: { where: { status: "ACTIVE" } } },
			},
		},
	});

	if (teamTransaction.participants.length === 0) {
		throw new Error("A team transaction needs at least one player.");
	}

	if (teamTransaction.participants.some((p) => p.shares.length !== 1)) {
		throw new Error("Each player must have exactly one share before finalizing.");
	}

	const zero = new Prisma.Decimal(0);
	const total = Prisma.Decimal.sum(zero, ...teamTransaction.items.map((i) => i.amount));
	const shared = Prisma.Decimal.sum(
		zero,
		...teamTransaction.participants.map((p) => p.shares[0].amount),
	);

	if (total.isZero()) {
		throw new Error("Add an amount before finalizing.");
	}

	if (!shared.equals(total)) {
		throw new Error(
			`Player shares must add up to the total. Shared ${shared.toFixed(2)} of ${total.toFixed(2)}.`,
		);
	}

	await tx.playerTransaction.createMany({
		data: teamTransaction.participants.map((participant) => ({
			playerId: participant.playerId,
			teamTransactionId: teamTransaction.id,
			shareId: participant.shares[0].id,
			amount: participant.shares[0].amount,
			direction: teamTransaction.direction,
			status: "INTERNAL" as const, // admins only until published
			date: teamTransaction.date,
			description: null,
		})),
	});
}
