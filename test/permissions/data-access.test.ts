// Who can read what. Admin data functions must redirect PARENT and logged-out
// users; parent data functions must only return players the parent is linked to.
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
	asAdmin,
	asAdminParent,
	asLoggedOut,
	asParent,
	expectRedirect,
	isRedirectError,
} from "../helpers/auth";

vi.mock("@/lib/prisma", async () => {
	const { prismaMock } = await import("../helpers/prisma-mock");
	return { prisma: prismaMock.client };
});

import { prismaMock } from "../helpers/prisma-mock";

import {
	getPlayers,
	getPlayerById,
} from "@/features/players/data/players";
import { getPlayerTeams } from "@/features/players/data/get-player-teams";
import { getPlayerFinancialSummary } from "@/features/players/data/get-player-financial-summary";
import {
	getTeams,
	getTeamById,
	getActiveTeams,
	getActiveTeamsWithPlayers,
} from "@/features/teams/data/teams";
import { getTeamPlayers } from "@/features/teams/data/get-team-players";
import { getAvailablePlayersForTeam } from "@/features/teams/data/get-available-players-for-team";
import {
	getFundraisers,
	getFundraiserById,
} from "@/features/fundraisers/data/fundraisers";
import {
	getFundraiserTeams,
	getAvailableFundraisersForTeam,
} from "@/features/fundraisers/data/fundraiserTeams";
import { getFundraiserFinancialSummary } from "@/features/fundraisers/data/get-fundraiser-financial-summary";
import { getActiveFundraiserAllocations } from "@/features/fundraisers/data/get-active-fundraiser-allocations";
import { getFundraiserContributions } from "@/features/fundraisers/data/get-fundraiser-contributions";
import { getFundraiserParticipants } from "@/features/fundraisers/data/get-fundraiser-participants";
import { getAdminUsers } from "@/features/users/data/get-admin-users";
import { getAvailablePlayers } from "@/features/users/data/get-available-players";
import { getMyLinkedPlayers } from "@/features/users/data/get-users-linked-players";
import { getAdminDashboardSummary } from "@/features/dashboard/data/get-admin-dashboard-summary";
import { getAdminFundraiserOverview } from "@/features/dashboard/data/get-admin-fundraiser-overview";
import { getPendingPlayerAccessRequests } from "@/features/player-access/data/get-pending-player-access-requests";
import { getMyAccessRequests } from "@/features/player-access/data/get-my-access-requests";
import { getMyLinkedPlayerIds } from "@/features/player-access/data/get-my-linked-player-ids";
import { getUnlinkedPlayers } from "@/features/player-access/data/get-unlinked-players";
import { requestPlayerAccess } from "@/features/player-access/actions/request-player-access";
import { cancelPlayerAccessRequest } from "@/features/player-access/actions/cancel-player-access-request";

import { getTransactionFeed } from "@/features/transactions/data/get-transaction-feed";
import {
	getActivePlayerOptions,
	getPlayerBalances,
	getPlayerLedgerForAdmin,
} from "@/features/players/data/players";
import { getTeamTransaction } from "@/features/transactions/data/get-team-transaction";
import { getTeamOptions } from "@/features/transactions/data/get-team-options";

const db = prismaMock.client;

// Runs fn and fails only if it redirected. Other errors (e.g. "not found"
// because the mocked database is empty) are fine for an access check.
async function expectNoRedirect(fn: () => Promise<unknown>) {
	try {
		await fn();
	} catch (error) {
		expect(isRedirectError(error), "user was redirected").toBe(false);
	}
}

beforeEach(() => {
	prismaMock.reset();
});

const ADMIN_DATA: [string, () => Promise<unknown>][] = [
	["getTransactionFeed", () => getTransactionFeed()],
	["getPlayerLedgerForAdmin", () => getPlayerLedgerForAdmin("p1")],
	["getPlayerBalances", () => getPlayerBalances(["p1"])],
	["getActivePlayerOptions", () => getActivePlayerOptions()],
	["getTeamTransaction", () => getTeamTransaction("tt1")],
	["getTeamOptions", () => getTeamOptions()],
	["getPlayers", () => getPlayers()],
	["getPlayerById", () => getPlayerById("p1")],
	["getPlayerTeams", () => getPlayerTeams("p1")],
	["getTeams", () => getTeams()],
	["getTeamById", () => getTeamById("t1")],
	["getActiveTeams", () => getActiveTeams()],
	["getActiveTeamsWithPlayers", () => getActiveTeamsWithPlayers()],
	["getTeamPlayers", () => getTeamPlayers("t1")],
	["getAvailablePlayersForTeam", () => getAvailablePlayersForTeam("t1")],
	["getFundraisers", () => getFundraisers()],
	["getFundraiserById", () => getFundraiserById("f1")],
	["getFundraiserTeams", () => getFundraiserTeams("f1")],
	[
		"getAvailableFundraisersForTeam",
		() => getAvailableFundraisersForTeam("t1"),
	],
	["getFundraiserFinancialSummary", () => getFundraiserFinancialSummary("f1")],
	[
		"getActiveFundraiserAllocations",
		() => getActiveFundraiserAllocations("f1"),
	],
	["getFundraiserContributions", () => getFundraiserContributions("f1")],
	["getFundraiserParticipants", () => getFundraiserParticipants("f1")],
	["getAdminUsers", () => getAdminUsers()],
	["getAvailablePlayers", () => getAvailablePlayers()],
	["getAdminDashboardSummary", () => getAdminDashboardSummary()],
	["getAdminFundraiserOverview", () => getAdminFundraiserOverview()],
	[
		"getPendingPlayerAccessRequests",
		() => getPendingPlayerAccessRequests(),
	],
];

describe.each(ADMIN_DATA)("admin data: %s", (_name, call) => {
	it("redirects a PARENT without querying", async () => {
		asParent();
		await expectRedirect(call);
		expect(prismaMock.calls).toEqual([]);
	});

	it("redirects a logged-out user without querying", async () => {
		asLoggedOut();
		await expectRedirect(call);
		expect(prismaMock.calls).toEqual([]);
	});

	it("allows an ADMIN", async () => {
		asAdmin();
		await expectNoRedirect(call);
	});

	it("allows an ADMIN_PARENT", async () => {
		asAdminParent();
		await expectNoRedirect(call);
	});
});

// requireParentAccess: PARENT and ADMIN_PARENT only
const PARENT_ONLY: [string, () => Promise<unknown>][] = [
	["getMyAccessRequests", () => getMyAccessRequests()],
	["getMyLinkedPlayers", () => getMyLinkedPlayers()],
	["requestPlayerAccess", () => requestPlayerAccess("p1")],
	["cancelPlayerAccessRequest", () => cancelPlayerAccessRequest("r1")],
];

describe.each(PARENT_ONLY)("parent-only: %s", (_name, call) => {
	it("redirects a plain ADMIN without querying", async () => {
		asAdmin();
		await expectRedirect(call);
		expect(prismaMock.calls).toEqual([]);
	});

	it("redirects a logged-out user without querying", async () => {
		asLoggedOut();
		await expectRedirect(call);
		expect(prismaMock.calls).toEqual([]);
	});

	it("allows a PARENT", async () => {
		asParent();
		await expectNoRedirect(call);
	});

	it("allows an ADMIN_PARENT", async () => {
		asAdminParent();
		await expectNoRedirect(call);
	});
});

describe("getUnlinkedPlayers", () => {
	// parent request page only: requires parent access
	it("redirects a logged-out user", async () => {
		asLoggedOut();
		await expectRedirect(() => getUnlinkedPlayers());
	});

	it("redirects a plain ADMIN (parent page only)", async () => {
		asAdmin();
		await expectRedirect(() => getUnlinkedPlayers());
	});

	it("allows a PARENT", async () => {
		asParent();
		await expectNoRedirect(() => getUnlinkedPlayers());
	});

	it("allows an ADMIN_PARENT", async () => {
		asAdminParent();
		await expectNoRedirect(() => getUnlinkedPlayers());
	});
});

describe("getMyLinkedPlayerIds", () => {
	it("redirects a logged-out user", async () => {
		asLoggedOut();
		await expectRedirect(() => getMyLinkedPlayerIds());
	});

	it("only queries links for the current user", async () => {
		asParent("parent-7");
		await getMyLinkedPlayerIds();
		expect(db.parentPlayerLink.findMany).toHaveBeenCalledWith(
			expect.objectContaining({ where: { userId: "parent-7" } }),
		);
	});
});


describe("getPlayerFinancialSummary (parent player page)", () => {
	function linkParent() {
		db.parentPlayerLink.findUnique.mockResolvedValue({ id: "link-1" });
		db.player.findUnique.mockResolvedValue({
			id: "p1",
			firstName: "jane",
			lastName: "doe",
			imageUrl: null,
			status: true,
		});
		db.teamPlayer.findMany.mockResolvedValue([
			{ team: { id: "t1", name: "U12" } },
		]);
	}

	it("works for a linked PARENT and does not redirect (regression: used admin-only getPlayerTeams)", async () => {
		asParent();
		linkParent();
		db.playerTransaction.findMany.mockResolvedValue([]);

		const result = await getPlayerFinancialSummary("p1");

		expect(result.player.id).toBe("p1");
		expect(result.teams).toEqual([{ id: "t1", name: "U12" }]);
		expect(result.summary.currentBalance).toBe(0);
	});

	it("checks the link for the current user and player", async () => {
		asParent("parent-9");
		linkParent();

		await getPlayerFinancialSummary("p1");

		expect(db.parentPlayerLink.findUnique).toHaveBeenCalledWith(
			expect.objectContaining({
				where: { userId_playerId: { userId: "parent-9", playerId: "p1" } },
			}),
		);
	});

	it("throws for a PARENT who is not linked, without loading the player", async () => {
		asParent();
		db.parentPlayerLink.findUnique.mockResolvedValue(null);

		await expect(getPlayerFinancialSummary("p1")).rejects.toThrow(
			"You do not have access to this player",
		);
		expect(db.player.findUnique).not.toHaveBeenCalled();
		expect(db.playerTransaction.findMany).not.toHaveBeenCalled();
	});

	it("redirects a logged-out user", async () => {
		asLoggedOut();
		await expectRedirect(() => getPlayerFinancialSummary("p1"));
	});

	// detailed balance math is tested in test/players/summarize-transactions.test.ts
	it("summarizes the transactions it loads", async () => {
		asParent();
		linkParent();
		db.playerTransaction.findMany.mockResolvedValue([
			{ id: "1", direction: "INCOME", amount: 50, description: null, date: new Date("2026-01-10"), fundraiser: null },
			{ id: "2", direction: "EXPENSE", amount: 30, description: null, date: new Date("2026-01-11"), fundraiser: null },
		]);

		const { summary } = await getPlayerFinancialSummary("p1");

		expect(summary.currentBalance).toBe(20);
		expect(summary.history).toHaveLength(2);
	});
});
