import { beforeEach, describe, expect, it, vi } from "vitest";
import { Prisma } from "@prisma/client";
import {
	assertTeamDraft,
	claimTeamStatus,
	parseMoney,
	writeTeamLedgerRows,
} from "@/features/transactions/lib/team-transaction";
import { parseDateInput } from "@/features/transactions/lib/dates";

const dec = (v: string) => new Prisma.Decimal(v);

const tx = {
	teamTransaction: {
		updateMany: vi.fn(),
		findUnique: vi.fn(),
		findUniqueOrThrow: vi.fn(),
	},
	playerTransaction: { createMany: vi.fn() },
};
const asTx = tx as unknown as Prisma.TransactionClient;

beforeEach(() => vi.clearAllMocks());

describe("parseMoney", () => {
	it("rounds to cents", () => {
		expect(parseMoney(10.005, "Total").toString()).toBe("10.01");
	});
	it("rejects zero unless allowed", () => {
		expect(() => parseMoney(0, "Total")).toThrow("Total must be greater than $0.");
		expect(parseMoney(0, "Each share", { allowZero: true }).isZero()).toBe(true);
	});
	it("rejects negatives and non-numbers", () => {
		expect(() => parseMoney(-1, "Total")).toThrow("greater than $0");
		expect(() => parseMoney(-1, "Each share", { allowZero: true })).toThrow("can't be negative");
		expect(() => parseMoney(Number.NaN, "Amount")).toThrow("Amount must be a valid number.");
	});
});

describe("parseDateInput", () => {
	it("parses YYYY-MM-DD as midnight UTC", () => {
		expect(parseDateInput("2026-11-06").toISOString()).toBe("2026-11-06T00:00:00.000Z");
	});
	it("rejects other formats", () => {
		expect(() => parseDateInput("11/06/2026")).toThrow("Enter a valid date.");
		expect(() => parseDateInput("2026-13-45")).toThrow("Enter a valid date.");
	});
});

describe("assertTeamDraft / claimTeamStatus", () => {
	it("locks a draft with a conditional update", async () => {
		tx.teamTransaction.updateMany.mockResolvedValue({ count: 1 });
		await assertTeamDraft(asTx, "tt1");
		expect(tx.teamTransaction.updateMany).toHaveBeenCalledWith({
			where: { id: "tt1", status: "DRAFT" },
			data: { updatedAt: expect.any(Date) },
		});
	});

	it("explains why a completed one can't be edited", async () => {
		tx.teamTransaction.updateMany.mockResolvedValue({ count: 0 });
		tx.teamTransaction.findUnique.mockResolvedValue({ status: "COMPLETED" });
		await expect(assertTeamDraft(asTx, "tt1")).rejects.toThrow(
			"Only draft team transactions can be edited. This one is final.",
		);
	});

	it("reports not found", async () => {
		tx.teamTransaction.updateMany.mockResolvedValue({ count: 0 });
		tx.teamTransaction.findUnique.mockResolvedValue(null);
		await expect(
			claimTeamStatus(asTx, "x", { from: "COMPLETED", to: "PUBLISHED", action: "published" }),
		).rejects.toThrow("Team transaction not found");
	});

	it("lists every allowed status", async () => {
		tx.teamTransaction.updateMany.mockResolvedValue({ count: 0 });
		tx.teamTransaction.findUnique.mockResolvedValue({ status: "DRAFT" });
		await expect(
			claimTeamStatus(asTx, "tt1", {
				from: ["COMPLETED", "PUBLISHED"],
				to: "DRAFT",
				action: "reopened",
			}),
		).rejects.toThrow(
			"Only final or shared team transactions can be reopened. This one is a draft.",
		);
	});
});

describe("writeTeamLedgerRows", () => {
	const base = {
		id: "tt1",
		direction: "EXPENSE",
		date: new Date("2026-11-08T00:00:00Z"),
		items: [{ amount: dec("100") }],
		participants: [
			{ playerId: "p1", shares: [{ id: "s1", amount: dec("60") }] },
			{ playerId: "p2", shares: [{ id: "s2", amount: dec("40") }] },
		],
	};

	it("writes one INTERNAL row per share, signed by the direction", async () => {
		tx.teamTransaction.findUniqueOrThrow.mockResolvedValue(base);
		await writeTeamLedgerRows(asTx, "tt1");

		expect(tx.playerTransaction.createMany).toHaveBeenCalledWith({
			data: [
				expect.objectContaining({
					playerId: "p1",
					teamTransactionId: "tt1",
					shareId: "s1",
					amount: dec("60"),
					direction: "EXPENSE",
					status: "INTERNAL",
					date: base.date,
				}),
				expect.objectContaining({ playerId: "p2", shareId: "s2", amount: dec("40") }),
			],
		});
	});


	it("signs team income rows as INCOME", async () => {
		tx.teamTransaction.findUniqueOrThrow.mockResolvedValue({ ...base, direction: "INCOME" });
		await writeTeamLedgerRows(asTx, "tt1");
		const rows = tx.playerTransaction.createMany.mock.calls[0][0].data;
		expect(rows.every((r: { direction: string }) => r.direction === "INCOME")).toBe(true);
	});

	it("includes $0 shares", async () => {
		tx.teamTransaction.findUniqueOrThrow.mockResolvedValue({
			...base,
			items: [{ amount: dec("60") }],
			participants: [
				base.participants[0],
				{ playerId: "p2", shares: [{ id: "s2", amount: dec("0") }] },
			],
		});
		await writeTeamLedgerRows(asTx, "tt1");
		expect(tx.playerTransaction.createMany.mock.calls[0][0].data).toHaveLength(2);
	});

	it("refuses shares that don't add up to the total", async () => {
		tx.teamTransaction.findUniqueOrThrow.mockResolvedValue({
			...base,
			items: [{ amount: dec("120") }],
		});
		await expect(writeTeamLedgerRows(asTx, "tt1")).rejects.toThrow(
			"Player shares must add up to the total. Shared 100.00 of 120.00.",
		);
		expect(tx.playerTransaction.createMany).not.toHaveBeenCalled();
	});

	it("compares cents exactly (0.1 + 0.2 = 0.3)", async () => {
		tx.teamTransaction.findUniqueOrThrow.mockResolvedValue({
			...base,
			items: [{ amount: dec("0.3") }],
			participants: [
				{ playerId: "p1", shares: [{ id: "s1", amount: dec("0.1") }] },
				{ playerId: "p2", shares: [{ id: "s2", amount: dec("0.2") }] },
			],
		});
		await expect(writeTeamLedgerRows(asTx, "tt1")).resolves.toBeUndefined();
	});

	it("refuses no players, missing shares, or a $0 total", async () => {
		tx.teamTransaction.findUniqueOrThrow.mockResolvedValueOnce({ ...base, participants: [] });
		await expect(writeTeamLedgerRows(asTx, "tt1")).rejects.toThrow("at least one player");

		tx.teamTransaction.findUniqueOrThrow.mockResolvedValueOnce({
			...base,
			participants: [{ playerId: "p1", shares: [] }],
		});
		await expect(writeTeamLedgerRows(asTx, "tt1")).rejects.toThrow("exactly one share");

		tx.teamTransaction.findUniqueOrThrow.mockResolvedValueOnce({
			...base,
			items: [],
			participants: [{ playerId: "p1", shares: [{ id: "s1", amount: dec("0") }] }],
		});
		await expect(writeTeamLedgerRows(asTx, "tt1")).rejects.toThrow("Add an amount before finalizing.");
	});
});
