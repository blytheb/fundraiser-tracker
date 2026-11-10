import type { FundraiserStatus, Prisma } from "@prisma/client";

// Shared status checks for fundraiser actions. Always call these with the
// transaction client (tx) inside prisma.$transaction: they take a row lock on
// the fundraiser that lasts until the transaction ends.

type Tx = Prisma.TransactionClient;

// "This fundraiser is a draft." / "...is completed." / "...is published."
const STATUS_PHRASES: Record<FundraiserStatus, string> = {
	DRAFT: "a draft",
	COMPLETED: "completed",
	PUBLISHED: "published",
};

const STATUS_ADJECTIVES: Record<FundraiserStatus, string> = {
	DRAFT: "draft",
	COMPLETED: "completed",
	PUBLISHED: "published",
};

// Called after a conditional update matched nothing: work out why and throw.
async function throwStatusError(
	tx: Tx,
	fundraiserId: string,
	allowed: FundraiserStatus[],
	action: string,
): Promise<never> {
	const fundraiser = await tx.fundraiser.findUnique({
		where: { id: fundraiserId },
		select: { status: true },
	});

	if (!fundraiser) {
		throw new Error("Fundraiser not found");
	}

	const allowedList = allowed.map((s) => STATUS_ADJECTIVES[s]).join(" or ");
	throw new Error(
		`Only ${allowedList} fundraisers can be ${action}. This fundraiser is ${STATUS_PHRASES[fundraiser.status]}.`,
	);
}

/**
 * Throws unless the fundraiser exists and is a DRAFT.
 *
 * It updates `updatedAt` instead of only reading the status: the update locks
 * the row until the transaction ends, so completeFundraiser can't run between
 * this check and the edit that follows it.
 *
 * @param action past tense for the error message, e.g. "edited", "deleted"
 */
export async function assertDraft(
	tx: Tx,
	fundraiserId: string,
	action = "edited",
) {
	const locked = await tx.fundraiser.updateMany({
		where: { id: fundraiserId, status: "DRAFT" },
		data: { updatedAt: new Date() },
	});

	if (locked.count === 0) {
		await throwStatusError(tx, fundraiserId, ["DRAFT"], action);
	}
}

/**
 * Moves the fundraiser from one of `from` to `to`, or throws a readable error.
 * The conditional update is the claim: if two requests race, only one matches.
 *
 * @param action past tense for the error message, e.g. "published", "reopened"
 */
export async function claimStatus(
	tx: Tx,
	fundraiserId: string,
	{
		from,
		to,
		action,
	}: {
		from: FundraiserStatus | FundraiserStatus[];
		to: FundraiserStatus;
		action: string;
	},
) {
	const allowed = Array.isArray(from) ? from : [from];

	const claimed = await tx.fundraiser.updateMany({
		where: { id: fundraiserId, status: { in: allowed } },
		data: { status: to },
	});

	if (claimed.count === 0) {
		await throwStatusError(tx, fundraiserId, allowed, action);
	}
}
