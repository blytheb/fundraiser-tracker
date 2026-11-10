import { describe, expect, it } from "vitest";
import { Prisma } from "@prisma/client";
import {
	summarizeTransactions,
	type SummaryTransaction,
} from "@/features/players/lib/summarize-transactions";

const date = (day: number) => new Date(`2026-01-${String(day).padStart(2, "0")}`);

function tx(
	overrides: Partial<SummaryTransaction> & Pick<SummaryTransaction, "id" | "type" | "amount">,
): SummaryTransaction {
	return { description: null, date: date(1), fundraiser: null, ...overrides };
}

describe("summarizeTransactions", () => {
	it("returns zeros and an empty history for no transactions", () => {
		expect(summarizeTransactions([])).toEqual({
			totalDeposits: 0,
			totalDistributions: 0,
			totalExpenses: 0,
			totalMoneyIn: 0,
			totalMoneyOut: 0,
			currentBalance: 0,
			history: [],
		});
	});

	it("calculates money in, money out and balance", () => {
		const summary = summarizeTransactions([
			tx({ id: "1", type: "PAYMENT", amount: 50, date: date(10) }),
			tx({ id: "2", type: "DISTRIBUTION", amount: 100, date: date(11) }),
			tx({ id: "3", type: "EXPENSE", amount: 30, date: date(12) }),
			tx({ id: "4", type: "ADJUSTMENT", amount: 20, date: date(13) }),
			tx({ id: "5", type: "ADJUSTMENT", amount: -5, date: date(14) }),
		]);

		expect(summary.totalDeposits).toBe(50);
		expect(summary.totalDistributions).toBe(100);
		expect(summary.totalExpenses).toBe(30);
		expect(summary.totalMoneyIn).toBe(170); // 50 + 100 + 20
		expect(summary.totalMoneyOut).toBe(35); // 30 + |-5|
		expect(summary.currentBalance).toBe(135);
	});

	it("can go negative when expenses exceed money in", () => {
		const summary = summarizeTransactions([
			tx({ id: "1", type: "PAYMENT", amount: 10 }),
			tx({ id: "2", type: "EXPENSE", amount: 25 }),
		]);

		expect(summary.currentBalance).toBe(-15);
	});

	it("treats expense amounts as money out even if stored as negative", () => {
		const summary = summarizeTransactions([
			tx({ id: "1", type: "EXPENSE", amount: -30 }),
			tx({ id: "2", type: "PAYMENT", amount: -50 }),
		]);

		expect(summary.totalExpenses).toBe(30);
		expect(summary.totalDeposits).toBe(50);
		expect(summary.currentBalance).toBe(20);
	});

	it("accepts Prisma.Decimal amounts and adds cents exactly", () => {
		const summary = summarizeTransactions([
			tx({ id: "1", type: "PAYMENT", amount: new Prisma.Decimal("0.1") }),
			tx({ id: "2", type: "PAYMENT", amount: new Prisma.Decimal("0.2") }),
			tx({ id: "3", type: "EXPENSE", amount: new Prisma.Decimal("0.3") }),
		]);

		// with plain numbers 0.1 + 0.2 - 0.3 = 5.55e-17
		expect(summary.totalDeposits).toBe(0.3);
		expect(summary.currentBalance).toBe(0);
	});

	it("sorts history newest first with signed amounts", () => {
		const { history } = summarizeTransactions([
			tx({ id: "old", type: "PAYMENT", amount: 50, date: date(1) }),
			tx({ id: "new", type: "EXPENSE", amount: 30, date: date(20) }),
			tx({ id: "mid", type: "ADJUSTMENT", amount: -5, date: date(10) }),
		]);

		expect(history.map((entry) => entry.id)).toEqual(["new", "mid", "old"]);
		expect(history.map((entry) => entry.amount)).toEqual([-30, -5, 50]);
	});

	it("uses the fundraiser name as the title for distributions", () => {
		const { history } = summarizeTransactions([
			tx({
				id: "1",
				type: "DISTRIBUTION",
				amount: 100,
				fundraiser: { name: "Car wash" },
			}),
			tx({ id: "2", type: "DISTRIBUTION", amount: 50, fundraiser: null }),
		]);

		expect(history.find((entry) => entry.id === "1")?.title).toBe("Car wash");
		expect(history.find((entry) => entry.id === "2")?.title).toBe(
			"Fundraiser Distribution",
		);
	});

	it("uses the saved description, or a default for the type", () => {
		const { history } = summarizeTransactions([
			tx({ id: "1", type: "EXPENSE", amount: 30, description: "Shoes" }),
			tx({ id: "2", type: "PAYMENT", amount: 50 }),
		]);

		expect(history.find((entry) => entry.id === "1")?.description).toBe("Shoes");
		expect(history.find((entry) => entry.id === "2")).toMatchObject({
			title: "Player Deposit",
			description: "Individual deposit",
		});
	});
});
