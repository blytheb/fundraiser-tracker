// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, cleanup, within } from "@testing-library/react";

import PlayerPage from "@/app/admin/players/[playerId]/page";

const { dataMock } = vi.hoisted(() => ({
	dataMock: {
		getPlayerById: vi.fn(),
		getPlayerLedgerForAdmin: vi.fn(),
		getActivePlayerOptions: vi.fn(),
		getPlayerTeams: vi.fn(),
	},
}));

vi.mock("@/features/players/data/players", () => ({
	getPlayerById: dataMock.getPlayerById,
	getPlayerLedgerForAdmin: dataMock.getPlayerLedgerForAdmin,
	getActivePlayerOptions: dataMock.getActivePlayerOptions,
}));

vi.mock("@/features/players/data/get-player-teams", () => ({
	getPlayerTeams: dataMock.getPlayerTeams,
}));

vi.mock("next/navigation", () => ({
	useRouter: () => ({ refresh: vi.fn(), push: vi.fn(), replace: vi.fn(), back: vi.fn() }),
	notFound: () => {
		throw new Error("NEXT_NOT_FOUND");
	},
}));

const page = (show?: string) =>
	PlayerPage({
		params: Promise.resolve({ playerId: "player-1" }),
		searchParams: Promise.resolve({ show }),
	});

beforeEach(() => {
	vi.clearAllMocks();
	dataMock.getPlayerById.mockResolvedValue({
		id: "player-1",
		firstName: "Jane",
		lastName: "Doe",
		imageUrl: null,
		status: true,
	});
	dataMock.getPlayerTeams.mockResolvedValue([{ id: "team-1", name: "U12 Boys" }]);
	dataMock.getActivePlayerOptions.mockResolvedValue([{ id: "player-1", name: "Jane Doe" }]);
	dataMock.getPlayerLedgerForAdmin.mockResolvedValue([]);
});

afterEach(() => cleanup());

describe("admin player page", () => {
	it("renders the player with an empty history", async () => {
		render(await page());

		expect(screen.getByRole("heading", { name: "Jane Doe" })).toBeInTheDocument();
		expect(screen.getByText("No transactions yet")).toBeInTheDocument();
		expect(screen.getByRole("link", { name: /U12 Boys/ })).toHaveAttribute("href", "/admin/teams/team-1");
		expect(screen.getByRole("button", { name: /Add transaction/ })).toBeInTheDocument();
	});

	it("shows Final rows, links team rows and makes individual rows editable", async () => {
		dataMock.getPlayerLedgerForAdmin.mockResolvedValue([
			{
				id: "t1",
				playerId: "player-1",
				amount: 100,
				direction: "INCOME",
				description: "Parent deposit",
				date: new Date("2026-11-02T00:00:00Z"),
				status: "PUBLISHED",
				teamTransaction: null,
				fundraiser: null,
			},
			{
				id: "t2",
				playerId: "player-1",
				amount: 50,
				direction: "EXPENSE",
				description: null,
				date: new Date("2026-11-08T00:00:00Z"),
				status: "INTERNAL",
				teamTransaction: { id: "tt-1", name: "Tournament fee" },
				fundraiser: null,
			},
		]);

		render(await page());

		// balance includes the Final row, with a note that it isn't shared yet
		expect(screen.getAllByText("$50.00").length).toBeGreaterThan(0);
		expect(screen.getByText(/isn't shared with parents yet/)).toBeInTheDocument();

		const teamRow = screen.getByRole("link", { name: /Tournament fee/ });
		expect(teamRow).toHaveAttribute("href", "/admin/transactions/team/tt-1");
		expect(within(teamRow).getByText("Final")).toBeInTheDocument();

		expect(screen.getByRole("button", { name: /Parent deposit/ })).toBeInTheDocument();
	});

	it("filters the history without changing the balance", async () => {
		dataMock.getPlayerLedgerForAdmin.mockResolvedValue([
			{
				id: "t1",
				playerId: "player-1",
				amount: 100,
				direction: "INCOME",
				description: "Parent deposit",
				date: new Date("2026-11-02T00:00:00Z"),
				status: "PUBLISHED",
				teamTransaction: null,
				fundraiser: null,
			},
		]);

		render(await page("expenses"));

		expect(screen.getByText("Nothing matches this filter")).toBeInTheDocument();
		expect(screen.getAllByText("$100.00").length).toBeGreaterThan(0); // balance still shown
	});
});
