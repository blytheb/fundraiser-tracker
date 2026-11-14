// Every admin-only server action must redirect PARENT and logged-out users
// before touching the database, and must let ADMIN_PARENT through.
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
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
import { createPotTransfer, deletePotTransfer } from "@/features/transactions/actions/pot-transfers";
import { saveTeamRoster } from "@/features/teams/actions/save-team-roster";

import { createIndividualTransaction } from "@/features/transactions/actions/create-individual-transaction";
import { saveTeamTransaction } from "@/features/transactions/actions/save-team-transaction";
import {
	updateIndividualTransaction,
	deleteIndividualTransaction,
} from "@/features/transactions/actions/individual-transactions";
import {
	completeTeamTransaction,
	publishTeamTransaction,
	unpublishTeamTransaction,
	reopenTeamTransaction,
	deleteTeamTransaction,
} from "@/features/transactions/actions/team-transaction-status";

import {
	createTeam,
	updateTeam,
	deleteTeam,
} from "@/features/teams/actions/teams";
import {
	createPlayer,
	updatePlayer,
	deletePlayer,
} from "@/features/players/actions/players";
import { assignPlayerToUser } from "@/features/users/actions/assign-player";
import { removePlayerFromUser } from "@/features/users/actions/remove-player";
import { updateUserRole } from "@/features/users/actions/update-user-role";
import { reviewPlayerAccess } from "@/features/player-access/actions/review-player-access";

const playerForm = { firstName: "Jane", lastName: "Doe", status: true };

const ADMIN_ACTIONS: [string, () => Promise<unknown>][] = [
	[
		"createPotTransfer",
		() =>
			createPotTransfer({
				playerId: "p1",
				fromPot: "GENERAL",
				toPot: "TRAVEL",
				amount: 5,
				date: "2026-01-01",
			}),
	],
	["deletePotTransfer", () => deletePotTransfer("t1")],
	[
		"saveTeamRoster",
		() => saveTeamRoster("t1", { playerIds: ["p1"], newPlayers: [] }),
	],
	[
		"createIndividualTransaction",
		() =>
			createIndividualTransaction({
				playerId: "p1",
				direction: "INCOME",
				amount: 5,
				date: "2026-01-01",
			}),
	],
	[
		"saveTeamTransaction",
		() =>
			saveTeamTransaction({
				name: "Fee",
				date: "2026-01-01",
				direction: "EXPENSE",
				paymentMethod: "CASH",
				total: 10,
				teamIds: [],
				shares: [{ playerId: "p1", amount: 10 }],
				complete: false,
			}),
	],
	[
		"updateIndividualTransaction",
		() =>
			updateIndividualTransaction("pt1", {
				playerId: "p1",
				direction: "EXPENSE",
				amount: 5,
				date: "2026-01-01",
			}),
	],
	["deleteIndividualTransaction", () => deleteIndividualTransaction("pt1")],
	["completeTeamTransaction", () => completeTeamTransaction("tt1")],
	["publishTeamTransaction", () => publishTeamTransaction("tt1")],
	["unpublishTeamTransaction", () => unpublishTeamTransaction("tt1")],
	["reopenTeamTransaction", () => reopenTeamTransaction("tt1")],
	["deleteTeamTransaction", () => deleteTeamTransaction("tt1")],
	// teams
	[
		"createTeam",
		() =>
			createTeam({
				name: "A",
				status: "IN_SEASON",
				playerIds: ["p1"],
				newPlayers: [],
			}),
	],
	["updateTeam", () => updateTeam("t1", { name: "A", status: "IN_SEASON" })],
	["deleteTeam", () => deleteTeam("t1")],
	// players
	["createPlayer", () => createPlayer(playerForm)],
	["updatePlayer", () => updatePlayer("p1", playerForm)],
	["deletePlayer", () => deletePlayer("p1")],
	// users
	["assignPlayerToUser", () => assignPlayerToUser("u2", "p1")],
	["removePlayerFromUser", () => removePlayerFromUser("u2", "p1")],
	["updateUserRole", () => updateUserRole("u2", "PARENT")],
	// player access (admin side)
	["reviewPlayerAccess", () => reviewPlayerAccess("r1", "APPROVED")],
];

beforeEach(() => {
	prismaMock.reset();
});

describe.each(ADMIN_ACTIONS)("%s", (_name, call) => {
	it("redirects a PARENT without touching the database", async () => {
		asParent();
		await expectRedirect(call);
		expect(prismaMock.calls).toEqual([]);
	});

	it("redirects a logged-out user without touching the database", async () => {
		asLoggedOut();
		await expectRedirect(call);
		expect(prismaMock.calls).toEqual([]);
	});

	it("lets an ADMIN_PARENT through and returns an ActionResult", async () => {
		asAdminParent();

		let result: unknown;
		try {
			result = await call();
		} catch (error) {
			expect(isRedirectError(error), "ADMIN_PARENT was redirected").toBe(
				false,
			);
			throw error;
		}

		// may be ok:false because the mocked database is empty; that's fine
		expect(result).toHaveProperty("ok");
	});
});
