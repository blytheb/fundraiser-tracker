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

import { completeFundraiser } from "@/features/fundraisers/actions/complete-fundraiser";
import {
	addContribution,
	updateContribution,
	deleteContribution,
} from "@/features/fundraisers/actions/contributions";
import { addTeamToFundraiser } from "@/features/fundraisers/actions/add-team-to-fundraiser";
import { publishFundraiser } from "@/features/fundraisers/actions/publish-fundraiser";
import {
	createFundraiser,
	updateFundraiser,
	deleteFundraiser,
} from "@/features/fundraisers/actions/fundraisers";
import { createFundraiserAndAddToTeam } from "@/features/fundraisers/actions/create-fundraiser-and-add-to-team";
import { reopenFundraiser } from "@/features/fundraisers/actions/reopen-fundraiser";
import { unpublishFundraiser } from "@/features/fundraisers/actions/unpublish-fundraiser";
import { saveFundraiserParticipants } from "@/features/fundraisers/actions/save-fundraiser-participants";
import { removeTeamFromFundraiser } from "@/features/fundraisers/actions/remove-team-from-fundraiser";
import { saveFundraiserTeams } from "@/features/fundraisers/actions/save-fundraiser-teams";
import { setCustomDistribution } from "@/features/fundraisers/actions/set-custom-distribution";
import {
	createTeam,
	updateTeam,
	deleteTeam,
} from "@/features/teams/actions/teams";
import { addPlayerPayment } from "@/features/players/actions/add-player-payment";
import { addPlayerExpense } from "@/features/players/actions/add-player-expense";
import {
	createPlayer,
	updatePlayer,
	deletePlayer,
} from "@/features/players/actions/players";
import { assignPlayerToUser } from "@/features/users/actions/assign-player";
import { removePlayerFromUser } from "@/features/users/actions/remove-player";
import { updateUserRole } from "@/features/users/actions/update-user-role";
import { reviewPlayerAccess } from "@/features/player-access/actions/review-player-access";

const contribution = {
	amount: 10,
	paymentMethod: "CASH" as const,
	source: "SALES" as const,
	date: "2026-01-01",
};
const fundraiserForm = {
	name: "Car wash",
	description: "desc",
	startDate: new Date("2026-01-01"),
};
const playerForm = { firstName: "Jane", lastName: "Doe", status: true };
const transaction = { playerId: "p1", amount: 5, date: "2026-01-01" };

const ADMIN_ACTIONS: [string, () => Promise<unknown>][] = [
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
	// fundraisers
	["completeFundraiser", () => completeFundraiser("f1")],
	["publishFundraiser", () => publishFundraiser("f1")],
	["unpublishFundraiser", () => unpublishFundraiser("f1")],
	["reopenFundraiser", () => reopenFundraiser("f1")],
	[
		"addContribution",
		() => addContribution({ fundraiserId: "f1", ...contribution }),
	],
	["updateContribution", () => updateContribution("c1", contribution)],
	["deleteContribution", () => deleteContribution("c1")],
	["addTeamToFundraiser", () => addTeamToFundraiser("f1", "t1")],
	["removeTeamFromFundraiser", () => removeTeamFromFundraiser("f1", "t1")],
	["createFundraiser", () => createFundraiser(fundraiserForm)],
	["updateFundraiser", () => updateFundraiser("f1", fundraiserForm)],
	["deleteFundraiser", () => deleteFundraiser("f1")],
	[
		"createFundraiserAndAddToTeam",
		() => createFundraiserAndAddToTeam("t1", fundraiserForm),
	],
	["saveFundraiserParticipants", () => saveFundraiserParticipants("f1", ["p1"])],
	["saveFundraiserTeams", () => saveFundraiserTeams("f1", ["t1"])],
	[
		"setCustomDistribution",
		() => setCustomDistribution("f1", [{ participantId: "fp1", amount: 10 }]),
	],
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
	["addPlayerPayment", () => addPlayerPayment(transaction)],
	["addPlayerExpense", () => addPlayerExpense(transaction)],
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
