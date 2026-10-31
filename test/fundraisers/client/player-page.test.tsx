// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";

import PlayerPage from "@/app/admin/players/[playerId]/page";

const { getPlayerByIdMock, getPlayerTeamsMock } = vi.hoisted(() => ({
	getPlayerByIdMock: vi.fn(),
	getPlayerTeamsMock: vi.fn(),
}));

vi.mock("@/features/players/data/players", () => ({
	getPlayerById: getPlayerByIdMock,
	getPlayerTransactions: vi.fn().mockResolvedValue([]),
}));

vi.mock("@/features/players/data/get-player-teams", () => ({
	getPlayerTeams: getPlayerTeamsMock,
}));

vi.mock("next/headers", () => ({
	headers: vi.fn().mockResolvedValue(new Headers()),
}));

vi.mock("@/lib/auth", () => ({
	auth: {
		api: {
			getSession: vi.fn().mockResolvedValue({
				user: {
					id: "admin-1",
					role: "ADMIN",
				},
			}),
		},
	},
}));

vi.mock("next/navigation", () => ({
	useRouter: () => ({
		refresh: vi.fn(),
		push: vi.fn(),
		replace: vi.fn(),
		back: vi.fn(),
	}),
}));
vi.mock("@/features/players/PlayerHeader", () => ({
	default: () => <div>Player Header</div>,
}));

vi.mock("@/components/reusable/SummaryBlock", () => ({
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
});

afterEach(() => {
	cleanup();
});

describe("PlayerPage", () => {
	it("renders the player page when there are no transactions", async () => {
		const page = await PlayerPage({
			params: Promise.resolve({ playerId: "player-1" }),
		});

		render(page);

		expect(screen.getByText("Jane Doe")).toBeInTheDocument();
		expect(screen.getByText("No transactions yet")).toBeInTheDocument();
		expect(screen.queryByText("TBA")).not.toBeInTheDocument();
	});

	it("does not display fundraiser placeholders or amounts from fundraiser data alone", async () => {
		const page = await PlayerPage({
			params: Promise.resolve({ playerId: "player-1" }),
		});

		render(page);

		expect(screen.queryByText("Travel Fundraiser")).not.toBeInTheDocument();
		expect(screen.queryByText("TBA")).not.toBeInTheDocument();
		expect(screen.getByText("No transactions yet")).toBeInTheDocument();
	});
});
