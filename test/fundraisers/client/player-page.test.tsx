// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";

import PlayerPage from "@/app/(protected)/players/[playerId]/page";

const { getPlayerByIdMock, getPlayerTeamsMock, getPublishedFundraisersMock } =
	vi.hoisted(() => ({
		getPlayerByIdMock: vi.fn(),
		getPlayerTeamsMock: vi.fn(),
		getPublishedFundraisersMock: vi.fn(),
	}));

vi.mock("@/features/players/data/players", () => ({
	getPlayerById: getPlayerByIdMock,
	getPlayerTransactions: vi.fn().mockResolvedValue([]),
}));

vi.mock("@/features/players/data/playerTeams", () => ({
	getPlayerTeams: getPlayerTeamsMock,
}));

vi.mock("@/features/fundraisers/data/fundraisers", () => ({
	getFundraisers: vi.fn(),
	getPublishedFundraisersByPlayer: getPublishedFundraisersMock,
}));

vi.mock("@/features/players/PlayerHeader", () => ({
	default: () => <div>Player Header</div>,
}));

vi.mock("@/components/ui-reusable/SummaryBlock", () => ({
	default: () => <div>Summary Block</div>,
}));

beforeEach(() => {
	vi.clearAllMocks();

	getPlayerByIdMock.mockResolvedValue({
		id: "player-1",
		firstName: "Jane",
		lastName: "Doe",
	});

	getPlayerTeamsMock.mockResolvedValue([]);

	getPublishedFundraisersMock.mockResolvedValue([
		{
			id: "fundraiser-1",
			name: "Travel Fundraiser",
			startDate: new Date("2026-01-01T12:00:00Z"),
			isCompleted: false,
			isPublished: false,
			transactions: [
				{
					id: "transaction-1",
					amount: "100.00",
					type: "DISTRIBUTION",
					status: "ACTIVE",
					date: new Date("2026-01-01T12:00:00Z"),
				},
			],
		},
	]);
});

afterEach(() => {
	cleanup();
});

describe("PlayerPage", () => {
	it("shows TBA for a published fundraiser that is not completed", async () => {
		const page = await PlayerPage({
			params: Promise.resolve({ playerId: "player-1" }),
		});

		render(page);

		expect(screen.getByText("Travel Fundraiser")).toBeInTheDocument();
		expect(screen.getByText("TBA")).toBeInTheDocument();
		expect(screen.queryByText("+ 100.00")).not.toBeInTheDocument();
	});

	it("shows the distribution transaction total for a completed fundraiser", async () => {
		getPublishedFundraisersMock.mockResolvedValue([
			{
				id: "fundraiser-1",
				name: "Travel Fundraiser",
				startDate: new Date("2026-01-01T12:00:00Z"),
				isCompleted: true,
				isPublished: false,

				transactions: [
					{
						id: "transaction-1",
						amount: "75.00",
						type: "DISTRIBUTION",
						status: "ACTIVE",
						date: new Date("2026-01-01T12:00:00Z"),
					},
					{
						id: "transaction-2",
						amount: "25.00",
						type: "DISTRIBUTION",
						status: "ACTIVE",
						date: new Date("2026-01-01T12:00:00Z"),
					},
				],
			},
		]);

		const page = await PlayerPage({
			params: Promise.resolve({ playerId: "player-1" }),
		});

		render(page);

		expect(screen.getByText("+ $100.00")).toBeInTheDocument();
		expect(screen.queryByText("TBA")).not.toBeInTheDocument();
	});

	it("displays completed and incomplete fundraisers independently", async () => {
		getPublishedFundraisersMock.mockResolvedValue([
			{
				id: "fundraiser-1",
				name: "Completed Fundraiser",
				startDate: new Date("2026-01-01T12:00:00Z"),
				isCompleted: true,
				transactions: [{ id: "transaction-1", amount: "150.00" }],
			},
			{
				id: "fundraiser-2",
				name: "Upcoming Fundraiser",
				startDate: new Date("2026-02-01T12:00:00Z"),
				isCompleted: false,
				transactions: [{ id: "transaction-2", amount: "200.00" }],
			},
		]);

		const page = await PlayerPage({
			params: Promise.resolve({ playerId: "player-1" }),
		});

		render(page);

		expect(screen.getByText("Completed Fundraiser")).toBeInTheDocument();
		expect(screen.getByText("+ $150.00")).toBeInTheDocument();
		expect(screen.getByText("Upcoming Fundraiser")).toBeInTheDocument();
		expect(screen.getByText("TBA")).toBeInTheDocument();
		expect(screen.queryByText("+ $200.00")).not.toBeInTheDocument();
	});
});
