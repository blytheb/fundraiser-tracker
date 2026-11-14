import { beforeEach, describe, expect, it, vi } from "vitest";

const { prismaMock, txMock } = vi.hoisted(() => {
	const txMock = {
		player: { findFirst: vi.fn(), findMany: vi.fn(), create: vi.fn(), update: vi.fn(), delete: vi.fn() },
		team: { create: vi.fn(), findMany: vi.fn(), findUnique: vi.fn() },
		teamPlayer: { createMany: vi.fn(), deleteMany: vi.fn(), findMany: vi.fn() },
		playerTransaction: { count: vi.fn() },
	};
	return { txMock, prismaMock: { $transaction: vi.fn() } };
});

vi.mock("@/lib/prisma", () => ({ prisma: prismaMock }));

import { cleanName, nameKey } from "@/features/players/lib/player-names";
import { createTeam } from "@/features/teams/actions/teams";
import { saveTeamRoster } from "@/features/teams/actions/save-team-roster";
import { createPlayer, deletePlayer, updatePlayer } from "@/features/players/actions/players";

beforeEach(() => {
	vi.clearAllMocks();
	prismaMock.$transaction.mockImplementation(async (callback) => callback(txMock));
	txMock.player.findFirst.mockResolvedValue(null); // no duplicate by default
	txMock.player.create.mockImplementation(async ({ data }) => ({ id: `new-${data.firstName}` }));
	txMock.team.create.mockResolvedValue({ id: "team-1", name: "U12" });
});

describe("player names", () => {
	it("cleans spacing and compares ignoring case", () => {
		expect(cleanName("  Jane   Ann ")).toBe("Jane Ann");
		expect(nameKey(" jane ", "DOE")).toBe(nameKey("Jane", "Doe"));
	});
});

describe("no duplicate players", () => {
	it("creates a player with the cleaned name", async () => {
		const result = await createPlayer({ firstName: "  Jane ", lastName: " Doe  ", status: true });

		expect(result.ok).toBe(true);
		expect(txMock.player.findFirst).toHaveBeenCalledWith({
			where: {
				firstName: { equals: "Jane", mode: "insensitive" },
				lastName: { equals: "Doe", mode: "insensitive" },
			},
			select: { firstName: true, lastName: true, status: true },
		});
		expect(txMock.player.create).toHaveBeenCalledWith({
			data: { firstName: "Jane", lastName: "Doe", status: true, imageUrl: null },
		});
	});

	it("refuses a name that already exists (any capitalization)", async () => {
		txMock.player.findFirst.mockResolvedValue({ firstName: "Jane", lastName: "Doe", status: true });

		expect(await createPlayer({ firstName: "jane", lastName: "DOE", status: true })).toEqual({
			ok: false,
			error: 'A player named "Jane Doe" already exists. Use that player instead of creating a new one.',
		});
		expect(txMock.player.create).not.toHaveBeenCalled();
	});

	it("mentions when the existing player is inactive", async () => {
		txMock.player.findFirst.mockResolvedValue({ firstName: "Jane", lastName: "Doe", status: false });
		const result = await createPlayer({ firstName: "Jane", lastName: "Doe", status: true });
		expect(result.ok).toBe(false);
		if (!result.ok) expect(result.error).toContain("(inactive)");
	});

	it("lets a player keep their own name when edited, but not take another's", async () => {
		await updatePlayer("p1", { firstName: "Jane", lastName: "Doe", status: true });
		expect(txMock.player.findFirst.mock.calls[0][0].where.id).toEqual({ not: "p1" });

		txMock.player.findFirst.mockResolvedValue({ firstName: "John", lastName: "Smith", status: true });
		const result = await updatePlayer("p1", { firstName: "John", lastName: "Smith", status: true });
		expect(result.ok).toBe(false);
		expect(txMock.player.update).toHaveBeenCalledTimes(1); // only the first, allowed edit
	});

	it("requires first and last name", async () => {
		expect(await createPlayer({ firstName: " ", lastName: "Doe", status: true })).toEqual({
			ok: false,
			error: "Enter the player's first and last name.",
		});
	});
});

describe("createTeam", () => {
	const base = { name: " U12 Boys ", status: "IN_SEASON" as const };

	it("creates the team with existing and new players in one transaction", async () => {
		txMock.player.findMany.mockResolvedValue([{ id: "p1" }, { id: "p2" }]);

		const result = await createTeam({
			...base,
			playerIds: ["p1", "p2", "p1"],
			newPlayers: [{ firstName: "Ana", lastName: "Lee" }],
		});

		expect(result.ok).toBe(true);
		expect(txMock.team.create).toHaveBeenCalledWith({
			data: { name: "U12 Boys", status: "IN_SEASON", imageUrl: null },
		});
		expect(txMock.teamPlayer.createMany).toHaveBeenCalledWith({
			data: [
				{ teamId: "team-1", playerId: "p1" },
				{ teamId: "team-1", playerId: "p2" },
				{ teamId: "team-1", playerId: "new-Ana" },
			],
		});
	});

	it("refuses a team with no players", async () => {
		expect(await createTeam({ ...base, playerIds: [], newPlayers: [] })).toEqual({
			ok: false,
			error: "Add at least one player to the team.",
		});
		expect(prismaMock.$transaction).not.toHaveBeenCalled();
	});

	it("refuses a missing name", async () => {
		expect(await createTeam({ ...base, name: "  ", playerIds: ["p1"], newPlayers: [] })).toEqual({
			ok: false,
			error: "Enter a team name.",
		});
	});

	it("refuses the same new player twice", async () => {
		const result = await createTeam({
			...base,
			playerIds: [],
			newPlayers: [
				{ firstName: "Ana", lastName: "Lee" },
				{ firstName: " ana", lastName: "LEE " },
			],
		});
		expect(result.ok).toBe(false);
		if (!result.ok) expect(result.error).toContain("was added twice");
	});

	it("refuses a new player who already exists, and creates nothing", async () => {
		txMock.player.findMany.mockResolvedValue([]);
		txMock.player.findFirst.mockResolvedValue({ firstName: "Ana", lastName: "Lee", status: true });

		const result = await createTeam({
			...base,
			playerIds: [],
			newPlayers: [{ firstName: "Ana", lastName: "Lee" }],
		});

		expect(result.ok).toBe(false);
		expect(txMock.team.create).not.toHaveBeenCalled();
	});

	it("refuses a selected player that no longer exists", async () => {
		txMock.player.findMany.mockResolvedValue([{ id: "p1" }]);
		const result = await createTeam({ ...base, playerIds: ["p1", "gone"], newPlayers: [] });
		expect(result.ok).toBe(false);
		expect(txMock.team.create).not.toHaveBeenCalled();
	});
});

describe("saveTeamRoster", () => {
	beforeEach(() => {
		txMock.team.findUnique.mockResolvedValue({ id: "t1" });
		txMock.teamPlayer.findMany.mockResolvedValue([{ playerId: "p1" }, { playerId: "p2" }]);
	});

	it("adds checked players and removes unchecked ones in one transaction", async () => {
		txMock.player.findMany.mockResolvedValue([{ id: "p2" }, { id: "p3" }]);

		const result = await saveTeamRoster("t1", { playerIds: ["p2", "p3"], newPlayers: [] });

		expect(result).toEqual({ ok: true, data: { added: 1, removed: 1, total: 2 } });
		expect(txMock.teamPlayer.deleteMany).toHaveBeenCalledWith({
			where: { teamId: "t1", playerId: { in: ["p1"] } },
		});
		expect(txMock.teamPlayer.createMany).toHaveBeenCalledWith({
			data: [{ teamId: "t1", playerId: "p3" }],
			skipDuplicates: true,
		});
	});

	it("creates new players and adds them", async () => {
		txMock.player.findMany.mockResolvedValue([{ id: "p1" }, { id: "p2" }]);

		const result = await saveTeamRoster("t1", {
			playerIds: ["p1", "p2"],
			newPlayers: [{ firstName: "Ana", lastName: "Lee" }],
		});

		expect(result).toEqual({ ok: true, data: { added: 1, removed: 0, total: 3 } });
		expect(txMock.teamPlayer.createMany).toHaveBeenCalledWith({
			data: [{ teamId: "t1", playerId: "new-Ana" }],
			skipDuplicates: true,
		});
		expect(txMock.teamPlayer.deleteMany).not.toHaveBeenCalled();
	});

	it("won't leave the team with no players", async () => {
		expect(await saveTeamRoster("t1", { playerIds: [], newPlayers: [] })).toEqual({
			ok: false,
			error: "A team needs at least one player.",
		});
		expect(prismaMock.$transaction).not.toHaveBeenCalled();
	});

	it("refuses a new player who already exists, and changes nothing", async () => {
		txMock.player.findMany.mockResolvedValue([{ id: "p1" }]);
		txMock.player.findFirst.mockResolvedValue({ firstName: "Ana", lastName: "Lee", status: true });

		const result = await saveTeamRoster("t1", {
			playerIds: ["p1"],
			newPlayers: [{ firstName: "ana", lastName: "lee" }],
		});

		expect(result.ok).toBe(false);
		expect(txMock.teamPlayer.deleteMany).not.toHaveBeenCalled();
		expect(txMock.teamPlayer.createMany).not.toHaveBeenCalled();
	});

	it("reports a missing team", async () => {
		txMock.team.findUnique.mockResolvedValue(null);
		expect(await saveTeamRoster("gone", { playerIds: ["p1"], newPlayers: [] })).toEqual({
			ok: false,
			error: "Team not found",
		});
	});
});

describe("deleting a player can't leave a team empty", () => {
	it("won't delete a player who is the only player on a team", async () => {
		txMock.playerTransaction.count.mockResolvedValue(0);
		txMock.team.findMany.mockResolvedValue([{ name: "U12 Boys" }]);

		const result = await deletePlayer("p1");

		expect(result).toEqual({
			ok: false,
			error:
				"This player is the only player on U12 Boys. Add another player to the team first, or delete the team.",
		});
		expect(txMock.player.delete).not.toHaveBeenCalled();
	});

	it("deletes a player with no transactions who isn't anyone's only player", async () => {
		txMock.playerTransaction.count.mockResolvedValue(0);
		txMock.team.findMany.mockResolvedValue([]);
		txMock.player.delete.mockResolvedValue({ id: "p1" });

		expect((await deletePlayer("p1")).ok).toBe(true);
	});
});
