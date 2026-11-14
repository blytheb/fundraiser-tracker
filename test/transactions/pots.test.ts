import { beforeEach, describe, expect, it, vi } from "vitest";
import { Prisma } from "@prisma/client";

const { prismaMock, txMock } = vi.hoisted(() => {
	const txMock = {
		player: { findUnique: vi.fn() },
		playerTransaction: { findMany: vi.fn(), createMany: vi.fn(), updateMany: vi.fn() },
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

import { summarizeTransactions, type SummaryTransaction } from "@/features/players/lib/summarize-transactions";
import { createPotTransfer, deletePotTransfer } from "@/features/transactions/actions/pot-transfers";
import { createIndividualTransaction } from "@/features/transactions/actions/create-individual-transaction";
import { parsePot } from "@/features/transactions/lib/pots";

const dec = (v: string) => new Prisma.Decimal(v);
const tx = (o: Partial<SummaryTransaction> & Pick<SummaryTransaction, "id" | "direction" | "amount">): SummaryTransaction => ({
	description: null,
	date: new Date("2026-11-01T00:00:00Z"),
	teamTransaction: null,
	...o,
});
const potOf = (summary: ReturnType<typeof summarizeTransactions>, pot: string) =>
	summary.pots.find((p) => p.pot === pot)!;

beforeEach(() => {
	vi.clearAllMocks();
	prismaMock.$transaction.mockImplementation(async (callback) => callback(txMock));
	txMock.player.findUnique.mockResolvedValue({ id: "p1" });
});

describe("balances per pot", () => {
	const ledger = [
		// $400 fundraiser money lands in General (the default)
		tx({ id: "1", direction: "INCOME", amount: 400, teamTransaction: { name: "Car wash" } }),
		// $200 deposit straight into Travel
		tx({ id: "2", direction: "INCOME", amount: 200, pot: "TRAVEL" }),
		// move $300 of fundraiser money from General to Travel
		tx({ id: "3a", direction: "EXPENSE", amount: 300, pot: "GENERAL", transferId: "t1" }),
		tx({ id: "3b", direction: "INCOME", amount: 300, pot: "TRAVEL", transferId: "t1" }),
		// tournament fee bigger than the Tournament pot -> balance due
		tx({ id: "4", direction: "EXPENSE", amount: 150, pot: "TOURNAMENT", teamTransaction: { name: "Fee" } }),
	];

	it("splits each pot by where the money came from", () => {
		const summary = summarizeTransactions(ledger);

		expect(potOf(summary, "GENERAL")).toMatchObject({ balance: 100, fundraiser: 400, movedOut: 300 });
		expect(potOf(summary, "TRAVEL")).toMatchObject({ balance: 500, deposits: 200, movedIn: 300 });
		expect(potOf(summary, "TOURNAMENT")).toMatchObject({ balance: -150, spent: 150 });
	});

	it("doesn't count moves as money in or out; pots add up to the balance", () => {
		const summary = summarizeTransactions(ledger);

		expect(summary.totalMoneyIn).toBe(600);
		expect(summary.totalMoneyOut).toBe(150);
		expect(summary.currentBalance).toBe(450);
		expect(summary.pots.reduce((sum, p) => sum + p.balance, 0)).toBe(450);
	});

	it("labels the two halves of a move", () => {
		const { history } = summarizeTransactions(ledger);
		expect(history.find((e) => e.id === "3a")).toMatchObject({
			kind: "TRANSFER",
			title: "Moved out of General",
			transferId: "t1",
		});
		expect(history.find((e) => e.id === "3b")?.title).toBe("Moved into Travel");
	});
});

describe("parsePot", () => {
	it("defaults to General and rejects unknown pots", () => {
		expect(parsePot(undefined)).toBe("GENERAL");
		expect(parsePot("TRAVEL")).toBe("TRAVEL");
		expect(() => parsePot("CANDY")).toThrow("Choose a pot.");
	});
});

describe("createIndividualTransaction with a pot", () => {
	it("records the deposit in the chosen pot", async () => {
		prismaMock.player.findUnique.mockResolvedValue({ id: "p1" });
		prismaMock.playerTransaction.create.mockResolvedValue({ id: "pt1" });

		await createIndividualTransaction({
			playerId: "p1",
			direction: "INCOME",
			pot: "TRAVEL",
			amount: 200,
			date: "2026-11-01",
		});

		expect(prismaMock.playerTransaction.create.mock.calls[0][0].data.pot).toBe("TRAVEL");
	});
});

describe("moving money between pots", () => {
	const input = {
		playerId: "p1",
		fromPot: "GENERAL" as const,
		toPot: "TRAVEL" as const,
		amount: 300,
		date: "2026-11-05",
	};

	it("writes one row out and one row in, sharing a transferId", async () => {
		txMock.playerTransaction.findMany.mockResolvedValue([
			{ amount: dec("400"), direction: "INCOME" },
		]);

		const result = await createPotTransfer(input);

		expect(result.ok).toBe(true);
		const rows = txMock.playerTransaction.createMany.mock.calls[0][0].data;
		expect(rows).toHaveLength(2);
		expect(rows[0]).toMatchObject({ direction: "EXPENSE", pot: "GENERAL", description: "Moved to Travel", status: "PUBLISHED" });
		expect(rows[1]).toMatchObject({ direction: "INCOME", pot: "TRAVEL", description: "Moved from General" });
		expect(rows[0].transferId).toBe(rows[1].transferId);
		expect(rows[0].amount).toEqual(dec("300"));
	});

	it("checks the balance of the pot money comes from", async () => {
		txMock.playerTransaction.findMany.mockResolvedValue([
			{ amount: dec("400"), direction: "INCOME" },
			{ amount: dec("250"), direction: "EXPENSE" },
		]);

		expect(await createPotTransfer(input)).toEqual({
			ok: false,
			error: "Only $150.00 is available in General.",
		});
		expect(txMock.playerTransaction.findMany).toHaveBeenCalledWith(
			expect.objectContaining({
				where: { playerId: "p1", pot: "GENERAL", status: { in: ["PUBLISHED", "INTERNAL"] } },
			}),
		);
		expect(txMock.playerTransaction.createMany).not.toHaveBeenCalled();
	});

	it("refuses moving into the same pot", async () => {
		expect(await createPotTransfer({ ...input, toPot: "GENERAL" })).toEqual({
			ok: false,
			error: "Choose two different pots.",
		});
	});

	it("undoing a move voids both rows", async () => {
		txMock.playerTransaction.updateMany.mockResolvedValue({ count: 2 });
		expect(await deletePotTransfer("t1")).toEqual({ ok: true, data: { transferId: "t1" } });
		expect(txMock.playerTransaction.updateMany).toHaveBeenCalledWith({
			where: { transferId: "t1", status: { not: "VOID" } },
			data: { status: "VOID" },
		});
	});

	it("reports a move that was already undone", async () => {
		txMock.playerTransaction.updateMany.mockResolvedValue({ count: 0 });
		expect((await deletePotTransfer("t1")).ok).toBe(false);
	});
});
