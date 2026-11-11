import { beforeEach, describe, expect, it, vi } from "vitest";
import { Prisma } from "@prisma/client";

const { prismaMock, txMock } = vi.hoisted(() => {
	const txMock = {
		teamTransaction: {
			create: vi.fn(),
			update: vi.fn(),
			updateMany: vi.fn(),
			findUnique: vi.fn(),
			findUniqueOrThrow: vi.fn(),
			delete: vi.fn(),
		},
		teamTransactionItem: { create: vi.fn(), deleteMany: vi.fn() },
		teamTransactionTeam: { createMany: vi.fn(), deleteMany: vi.fn() },
		teamTransactionParticipant: { createMany: vi.fn(), deleteMany: vi.fn(), findMany: vi.fn() },
		teamTransactionShare: { createMany: vi.fn() },
		playerTransaction: { createMany: vi.fn(), updateMany: vi.fn(), count: vi.fn() },
	};
	return {
		txMock,
		prismaMock: {
			$transaction: vi.fn(),
			player: { findUnique: vi.fn() },
			playerTransaction: { create: vi.fn() },
		},
	};
});

vi.mock("@/lib/prisma", () => ({ prisma: prismaMock }));

import { createIndividualTransaction } from "@/features/transactions/actions/create-individual-transaction";
import { saveTeamTransaction, type TeamTransactionInput } from "@/features/transactions/actions/save-team-transaction";
import {
	deleteTeamTransaction,
	publishTeamTransaction,
	reopenTeamTransaction,
	unpublishTeamTransaction,
} from "@/features/transactions/actions/team-transaction-status";

beforeEach(() => {
	vi.clearAllMocks();
	prismaMock.$transaction.mockImplementation(async (callback) => callback(txMock));
	txMock.teamTransaction.updateMany.mockResolvedValue({ count: 1 });
	txMock.teamTransaction.create.mockResolvedValue({ id: "tt-new" });
	txMock.teamTransactionParticipant.findMany.mockResolvedValue([
		{ id: "part-1", playerId: "p1" },
		{ id: "part-2", playerId: "p2" },
	]);
});

describe("createIndividualTransaction", () => {
	const input = {
		playerId: "p1",
		direction: "EXPENSE" as const,
		amount: 45.5,
		date: "2026-11-05",
		description: "  Uniform  ",
	};

	it("posts the transaction for the player", async () => {
		prismaMock.player.findUnique.mockResolvedValue({ id: "p1" });
		prismaMock.playerTransaction.create.mockResolvedValue({ id: "pt1" });

		const result = await createIndividualTransaction(input);

		expect(result).toEqual({ ok: true, data: { id: "pt1" } });
		expect(prismaMock.playerTransaction.create).toHaveBeenCalledWith({
			data: {
				playerId: "p1",
				direction: "EXPENSE",
				type: "EXPENSE",
				amount: new Prisma.Decimal("45.5"),
				date: new Date("2026-11-05T00:00:00.000Z"),
				description: "Uniform",
				status: "PUBLISHED",
			},
			select: { id: true },
		});
	});

	it("uses the legacy PAYMENT type for income", async () => {
		prismaMock.player.findUnique.mockResolvedValue({ id: "p1" });
		prismaMock.playerTransaction.create.mockResolvedValue({ id: "pt1" });
		await createIndividualTransaction({ ...input, direction: "INCOME" });
		expect(prismaMock.playerTransaction.create.mock.calls[0][0].data.type).toBe("PAYMENT");
	});

	it.each([
		[{ amount: 0 }, "Amount must be greater than $0."],
		[{ date: "nope" }, "Enter a valid date."],
		[{ direction: "SIDEWAYS" }, "Choose income or expense."],
	])("rejects bad input %o", async (override, message) => {
		const result = await createIndividualTransaction({ ...input, ...(override as object) } as typeof input);
		expect(result).toEqual({ ok: false, error: message });
		expect(prismaMock.playerTransaction.create).not.toHaveBeenCalled();
	});

	it("rejects an unknown player", async () => {
		prismaMock.player.findUnique.mockResolvedValue(null);
		expect(await createIndividualTransaction(input)).toEqual({ ok: false, error: "Choose a player." });
	});
});

describe("saveTeamTransaction", () => {
	const input: TeamTransactionInput = {
		name: " Tournament fee ",
		description: "",
		date: "2026-11-08",
		direction: "EXPENSE",
		paymentMethod: "CHECK",
		total: 100,
		teamIds: ["t1", "t1", "t2"],
		shares: [
			{ playerId: "p1", amount: 60 },
			{ playerId: "p2", amount: 40 },
		],
		complete: false,
	};

	it("creates a draft with one item, the teams and one share per player", async () => {
		const result = await saveTeamTransaction(input);

		expect(result).toEqual({ ok: true, data: { id: "tt-new" } });
		expect(txMock.teamTransaction.create).toHaveBeenCalledWith({
			data: {
				name: "Tournament fee",
				description: null,
				date: new Date("2026-11-08T00:00:00.000Z"),
				direction: "EXPENSE",
			},
			select: { id: true },
		});
		expect(txMock.teamTransactionItem.create).toHaveBeenCalledWith({
			data: expect.objectContaining({
				teamTransactionId: "tt-new",
				amount: new Prisma.Decimal("100"),
				paymentMethod: "CHECK",
			}),
		});
		// duplicate team ids removed
		expect(txMock.teamTransactionTeam.createMany).toHaveBeenCalledWith({
			data: [
				{ teamTransactionId: "tt-new", teamId: "t1" },
				{ teamTransactionId: "tt-new", teamId: "t2" },
			],
		});
		expect(txMock.teamTransactionShare.createMany).toHaveBeenCalledWith({
			data: [
				{ participantId: "part-1", amount: new Prisma.Decimal("60") },
				{ participantId: "part-2", amount: new Prisma.Decimal("40") },
			],
		});
		// a draft doesn't touch the ledger
		expect(txMock.playerTransaction.createMany).not.toHaveBeenCalled();
	});

	it("replaces the parts of an existing draft when editing", async () => {
		await saveTeamTransaction({ ...input, id: "tt1" });

		expect(txMock.teamTransaction.updateMany).toHaveBeenCalledWith({
			where: { id: "tt1", status: "DRAFT" },
			data: { updatedAt: expect.any(Date) },
		});
		expect(txMock.teamTransactionParticipant.deleteMany).toHaveBeenCalledWith({
			where: { teamTransactionId: "tt1" },
		});
		expect(txMock.teamTransaction.create).not.toHaveBeenCalled();
	});

	it("refuses to edit one that isn't a draft", async () => {
		txMock.teamTransaction.updateMany.mockResolvedValue({ count: 0 });
		txMock.teamTransaction.findUnique.mockResolvedValue({ status: "PUBLISHED" });

		expect(await saveTeamTransaction({ ...input, id: "tt1" })).toEqual({
			ok: false,
			error: "Only draft team transactions can be edited. This one is published.",
		});
	});

	it("completes and writes the ledger when asked", async () => {
		txMock.teamTransaction.findUniqueOrThrow.mockResolvedValue({
			id: "tt-new",
			direction: "EXPENSE",
			date: new Date("2026-11-08T00:00:00Z"),
			items: [{ amount: new Prisma.Decimal("100") }],
			participants: [
				{ playerId: "p1", shares: [{ id: "s1", amount: new Prisma.Decimal("60") }] },
				{ playerId: "p2", shares: [{ id: "s2", amount: new Prisma.Decimal("40") }] },
			],
		});

		const result = await saveTeamTransaction({ ...input, complete: true });

		expect(result.ok).toBe(true);
		expect(txMock.teamTransaction.updateMany).toHaveBeenCalledWith({
			where: { id: "tt-new", status: { in: ["DRAFT"] } },
			data: { status: "COMPLETED" },
		});
		expect(txMock.playerTransaction.createMany).toHaveBeenCalled();
	});

	it.each([
		[{ name: "  " }, "Enter a name."],
		[{ total: 0 }, "Total must be greater than $0."],
		[{ shares: [] }, "Add at least one player."],
		[
			{ shares: [{ playerId: "p1", amount: 50 }, { playerId: "p1", amount: 50 }] },
			"A player was added more than once.",
		],
		[{ shares: [{ playerId: "p1", amount: -5 }] }, "Each share can't be negative."],
	])("rejects bad input %o", async (override, message) => {
		const result = await saveTeamTransaction({ ...input, ...override });
		expect(result).toEqual({ ok: false, error: message });
		expect(prismaMock.$transaction).not.toHaveBeenCalled();
	});
});

describe("team transaction status actions", () => {
	it("publish shows the shares to parents", async () => {
		await publishTeamTransaction("tt1");
		expect(txMock.playerTransaction.updateMany).toHaveBeenCalledWith({
			where: { teamTransactionId: "tt1", status: "INTERNAL" },
			data: { status: "PUBLISHED" },
		});
	});

	it("unpublish hides them again", async () => {
		await unpublishTeamTransaction("tt1");
		expect(txMock.playerTransaction.updateMany).toHaveBeenCalledWith({
			where: { teamTransactionId: "tt1", status: "PUBLISHED" },
			data: { status: "INTERNAL" },
		});
	});

	it("reopen voids the ledger rows", async () => {
		await reopenTeamTransaction("tt1");
		expect(txMock.teamTransaction.updateMany).toHaveBeenCalledWith({
			where: { id: "tt1", status: { in: ["COMPLETED", "PUBLISHED"] } },
			data: { status: "DRAFT" },
		});
		expect(txMock.playerTransaction.updateMany).toHaveBeenCalledWith({
			where: { teamTransactionId: "tt1", status: { in: ["INTERNAL", "PUBLISHED"] } },
			data: { status: "VOID" },
		});
	});

	it("deletes a draft with no history", async () => {
		txMock.playerTransaction.count.mockResolvedValue(0);
		expect(await deleteTeamTransaction("tt1")).toEqual({ ok: true, data: { id: "tt1" } });
		expect(txMock.teamTransaction.delete).toHaveBeenCalledWith({ where: { id: "tt1" } });
	});

	it("keeps a draft that was completed before", async () => {
		txMock.playerTransaction.count.mockResolvedValue(2);
		const result = await deleteTeamTransaction("tt1");
		expect(result.ok).toBe(false);
		expect(txMock.teamTransaction.delete).not.toHaveBeenCalled();
	});
});
