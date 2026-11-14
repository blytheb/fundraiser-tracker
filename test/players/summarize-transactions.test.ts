import { describe, expect, it } from "vitest";
import { Prisma } from "@prisma/client";
import {
	summarizeTransactions,
	type SummaryTransaction,
} from "@/features/players/lib/summarize-transactions";

const date = (day: number) => new Date(`2026-01-${String(day).padStart(2, "0")}`);

function tx(
	overrides: Partial<SummaryTransaction> &
		Pick<SummaryTransaction, "id" | "direction" | "amount">,
): SummaryTransaction {
	return {
		description: null,
		date: date(1),
		teamTransaction: null,
		...overrides,
	};
}

const team = (name: string) => ({ teamTransaction: { name } });

describe("summarizeTransactions", () => {
	it("returns zeros and an empty history for no transactions", () => {
		expect(summarizeTransactions([])).toEqual({
			individualIncome: 0,
			individualExpenses: 0,
			teamIncome: 0,
			teamExpenses: 0,
			totalMoneyIn: 0,
			totalMoneyOut: 0,
			currentBalance: 0,
			notYetShared: 0,
			history: [],
		});
	});

	it("adds income and subtracts expenses", () => {
		const summary = summarizeTransactions([
			tx({ id: "1", direction: "INCOME", amount: 50 }), // individual income
			tx({ id: "2", direction: "INCOME", amount: 100, ...team("Car wash") }), // team income
			tx({ id: "3", direction: "EXPENSE", amount: 30 }), // individual expense
			tx({ id: "4", direction: "EXPENSE", amount: 40, ...team("Tournament fee") }), // team expense
		]);

		expect(summary.individualIncome).toBe(50);
		expect(summary.teamIncome).toBe(100);
		expect(summary.individualExpenses).toBe(30);
		expect(summary.teamExpenses).toBe(40);
		expect(summary.totalMoneyIn).toBe(150);
		expect(summary.totalMoneyOut).toBe(70);
		expect(summary.currentBalance).toBe(80);
	});


	it("counts Final (INTERNAL) rows but reports what isn't shared with parents yet", () => {
		const summary = summarizeTransactions([
			tx({ id: "1", direction: "INCOME", amount: 100 }), // shared
			tx({ id: "2", direction: "EXPENSE", amount: 30, status: "INTERNAL", ...team("Fee") }),
		]);

		expect(summary.currentBalance).toBe(70);
		expect(summary.notYetShared).toBe(-30);
		expect(summary.history.find((e) => e.id === "2")?.shared).toBe(false);
		expect(summary.history.find((e) => e.id === "1")?.shared).toBe(true);
	});

	it("can go negative when expenses exceed income", () => {
		const summary = summarizeTransactions([
			tx({ id: "1", direction: "INCOME", amount: 10 }),
			tx({ id: "2", direction: "EXPENSE", amount: 25 }),
		]);

		expect(summary.currentBalance).toBe(-15);
	});

	it("uses direction for the sign even if a legacy amount is stored negative", () => {
		const summary = summarizeTransactions([
			tx({ id: "1", direction: "EXPENSE", amount: -30 }), // old negative adjustment
			tx({ id: "2", direction: "INCOME", amount: 50 }),
		]);

		expect(summary.individualExpenses).toBe(30);
		expect(summary.currentBalance).toBe(20);
		expect(summary.history.find((entry) => entry.id === "1")?.amount).toBe(-30);
	});

	it("accepts Prisma.Decimal amounts and adds cents exactly", () => {
		const summary = summarizeTransactions([
			tx({ id: "1", direction: "INCOME", amount: new Prisma.Decimal("0.1") }),
			tx({ id: "2", direction: "INCOME", amount: new Prisma.Decimal("0.2") }),
			tx({ id: "3", direction: "EXPENSE", amount: new Prisma.Decimal("0.3") }),
		]);

		// with plain numbers 0.1 + 0.2 - 0.3 = 5.55e-17
		expect(summary.individualIncome).toBe(0.3);
		expect(summary.currentBalance).toBe(0);
	});

	it("sorts history newest first with signed amounts and a kind", () => {
		const { history } = summarizeTransactions([
			tx({ id: "old", direction: "INCOME", amount: 50, date: date(1) }),
			tx({ id: "new", direction: "EXPENSE", amount: 30, date: date(20), ...team("Fee") }),
			tx({ id: "mid", direction: "EXPENSE", amount: 5, date: date(10) }),
		]);

		expect(history.map((entry) => entry.id)).toEqual(["new", "mid", "old"]);
		expect(history.map((entry) => entry.amount)).toEqual([-30, -5, 50]);
		expect(history.map((entry) => entry.kind)).toEqual([
			"TEAM_EXPENSE",
			"INDIVIDUAL_EXPENSE",
			"INDIVIDUAL_INCOME",
		]);
	});

	it("titles team rows with the team transaction name", () => {
		const { history } = summarizeTransactions([
			tx({ id: "1", direction: "EXPENSE", amount: 40, ...team("Tournament fee") }),
		]);

		expect(history[0]).toMatchObject({
			title: "Tournament fee",
			description: "Share of team expense",
		});
	});

	it("uses the saved description, or a default for the kind", () => {
		const { history } = summarizeTransactions([
			tx({ id: "1", direction: "EXPENSE", amount: 30, description: "Shoes" }),
			tx({ id: "2", direction: "INCOME", amount: 50 }),
		]);

		expect(history.find((entry) => entry.id === "1")?.description).toBe("Shoes");
		expect(history.find((entry) => entry.id === "2")).toMatchObject({
			title: "Player Deposit",
			description: "Individual deposit",
		});
	});
});
