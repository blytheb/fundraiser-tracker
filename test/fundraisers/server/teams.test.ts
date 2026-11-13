import { beforeEach, describe, expect, it, vi } from "vitest";

const { prismaMock } = vi.hoisted(() => ({
	prismaMock: {
		fundraiserTeam: {
			create: vi.fn(),
			delete: vi.fn(),
			deleteMany: vi.fn(),
			createMany: vi.fn(),
		},
		fundraiser: {
			create: vi.fn(),
			findUnique: vi.fn(),
		},
		teamPlayer: {
			findMany: vi.fn(),
		},
		fundraiserParticipant: {
			deleteMany: vi.fn(),
		},
		$transaction: vi.fn(),
	},
}));

vi.mock("@/lib/prisma", () => ({
	prisma: prismaMock,
}));

import { asParent, expectRedirect } from "../../helpers/auth";
import { addTeamToFundraiser } from "@/features/fundraisers/actions/add-team-to-fundraiser";
import { removeTeamFromFundraiser } from "@/features/fundraisers/actions/remove-team-from-fundraiser";
import { createFundraiserAndAddToTeam } from "@/features/fundraisers/actions/create-fundraiser-and-add-to-team";
import { saveFundraiserTeams } from "@/features/fundraisers/actions/save-fundraiser-teams";

// tx used by add/remove team (they now run inside prisma.$transaction)
const teamTx = {
	fundraiser: { updateMany: vi.fn(), findUnique: vi.fn() },
	fundraiserTeam: { create: vi.fn(), delete: vi.fn() },
};

beforeEach(() => {
	vi.clearAllMocks();
	prismaMock.$transaction.mockImplementation(async (callback) =>
		callback(teamTx),
	);
	teamTx.fundraiser.updateMany.mockResolvedValue({ count: 1 });
});

describe("addTeamToFundraiser", () => {
	it("adds a team to a draft fundraiser inside a transaction", async () => {
		const fundraiserTeam = { fundraiserId: "fundraiser-1", teamId: "team-1" };
		teamTx.fundraiserTeam.create.mockResolvedValue(fundraiserTeam);

		const result = await addTeamToFundraiser("fundraiser-1", "team-1");

		expect(teamTx.fundraiser.updateMany).toHaveBeenCalledWith({
			where: { id: "fundraiser-1", status: "DRAFT" },
			data: { updatedAt: expect.any(Date) },
		});
		expect(teamTx.fundraiserTeam.create).toHaveBeenCalledWith({
			data: { fundraiserId: "fundraiser-1", teamId: "team-1" },
		});
		expect(prismaMock.fundraiserTeam.create).not.toHaveBeenCalled();
		expect(result).toEqual({ ok: true, data: fundraiserTeam });
	});

	it("rejects adding a team to a completed fundraiser", async () => {
		teamTx.fundraiser.updateMany.mockResolvedValue({ count: 0 });
		teamTx.fundraiser.findUnique.mockResolvedValue({ status: "COMPLETED" });

		expect(await addTeamToFundraiser("fundraiser-1", "team-1")).toEqual({
			ok: false,
			error:
				"Only draft fundraisers can be edited. This fundraiser is final.",
		});
		expect(teamTx.fundraiserTeam.create).not.toHaveBeenCalled();
	});
});

describe("removeTeamFromFundraiser", () => {
	it("removes a team from a draft fundraiser inside a transaction", async () => {
		const fundraiserTeam = { fundraiserId: "fundraiser-1", teamId: "team-1" };
		teamTx.fundraiserTeam.delete.mockResolvedValue(fundraiserTeam);

		const result = await removeTeamFromFundraiser("fundraiser-1", "team-1");

		expect(teamTx.fundraiserTeam.delete).toHaveBeenCalledWith({
			where: {
				fundraiserId_teamId: { fundraiserId: "fundraiser-1", teamId: "team-1" },
			},
		});
		expect(prismaMock.fundraiserTeam.delete).not.toHaveBeenCalled();
		expect(result).toEqual({ ok: true, data: fundraiserTeam });
	});

	it("rejects removing a team from a published fundraiser", async () => {
		teamTx.fundraiser.updateMany.mockResolvedValue({ count: 0 });
		teamTx.fundraiser.findUnique.mockResolvedValue({ status: "PUBLISHED" });

		expect(await removeTeamFromFundraiser("fundraiser-1", "team-1")).toEqual({
			ok: false,
			error:
				"Only draft fundraisers can be edited. This fundraiser is shared with parents.",
		});
		expect(teamTx.fundraiserTeam.delete).not.toHaveBeenCalled();
	});
});

describe("createFundraiserAndAddToTeam", () => {
	it("creates a fundraiser and associates it with a team", async () => {
		const fundraiser = {
			id: "fundraiser-1",
			name: "Cookie Sale",
			description: "No description",
			startDate: new Date("2010-01-01"),
		};

		const txMock = {
			fundraiser: {
				create: vi.fn().mockResolvedValue(fundraiser),
			},
			fundraiserTeam: {
				create: vi.fn().mockResolvedValue({
					fundraiserId: "fundraiser-1",
					teamId: "team-1",
				}),
			},
		};

		prismaMock.$transaction.mockImplementation(async (callback) =>
			callback(txMock),
		);

		const result = await createFundraiserAndAddToTeam("team-1", {
			name: "Cookie Sale",
		} as never);

		expect(txMock.fundraiser.create).toHaveBeenCalledWith({
			data: {
				name: "Cookie Sale",
				description: "No description",
				startDate: new Date("2010-01-01"),
			},
		});

		expect(txMock.fundraiserTeam.create).toHaveBeenCalledWith({
			data: {
				teamId: "team-1",
				fundraiserId: "fundraiser-1",
			},
		});

		expect(result).toEqual({ ok: true, data: fundraiser });
	});
});

describe("saveFundraiserTeams", () => {
	it("saves selected teams and removes ineligible participants", async () => {
		const txMock = {
			teamPlayer: {
				findMany: vi
					.fn()
					.mockResolvedValue([
						{ playerId: "player-1" },
						{ playerId: "player-2" },
					]),
			},
			fundraiserTeam: {
				deleteMany: vi.fn().mockResolvedValue({ count: 1 }),
				createMany: vi.fn().mockResolvedValue({ count: 1 }),
			},
			fundraiserParticipant: {
				deleteMany: vi.fn().mockResolvedValue({ count: 1 }),
			},
			fundraiser: {
				updateMany: vi.fn().mockResolvedValue({ count: 1 }),
				findUnique: vi.fn().mockResolvedValue({ id: "fundraiser-1" }),
			},
		};

		prismaMock.$transaction.mockImplementation(async (callback) =>
			callback(txMock),
		);

		await saveFundraiserTeams("fundraiser-1", ["team-1"]);

		expect(txMock.teamPlayer.findMany).toHaveBeenCalledWith({
			where: { teamId: { in: ["team-1"] } },
			select: { playerId: true },
		});

		expect(txMock.fundraiserTeam.deleteMany).toHaveBeenCalledWith({
			where: { fundraiserId: "fundraiser-1" },
		});

		expect(txMock.fundraiserTeam.createMany).toHaveBeenCalledWith({
			data: [{ fundraiserId: "fundraiser-1", teamId: "team-1" }],
		});

		expect(txMock.fundraiserParticipant.deleteMany).toHaveBeenCalledWith({
			where: {
				fundraiserId: "fundraiser-1",
				playerId: { notIn: ["player-1", "player-2"] },
			},
		});

		expect(txMock.fundraiser.findUnique).toHaveBeenCalledWith({
			where: { id: "fundraiser-1" },
			include: { teams: { include: { team: true } } },
		});
	});

	it("removes all teams and participants when no teams are selected", async () => {
		const txMock = {
			teamPlayer: {
				findMany: vi.fn().mockResolvedValue([]),
			},
			fundraiserTeam: {
				deleteMany: vi.fn().mockResolvedValue({ count: 2 }),
				createMany: vi.fn(),
			},
			fundraiserParticipant: {
				deleteMany: vi.fn().mockResolvedValue({ count: 3 }),
			},
			fundraiser: {
				updateMany: vi.fn().mockResolvedValue({ count: 1 }),
				findUnique: vi.fn().mockResolvedValue({ id: "fundraiser-1" }),
			},
		};

		prismaMock.$transaction.mockImplementation(async (callback) =>
			callback(txMock),
		);

		await saveFundraiserTeams("fundraiser-1", []);

		expect(txMock.fundraiserTeam.deleteMany).toHaveBeenCalledWith({
			where: { fundraiserId: "fundraiser-1" },
		});

		expect(txMock.fundraiserTeam.createMany).not.toHaveBeenCalled();

		expect(txMock.fundraiserParticipant.deleteMany).toHaveBeenCalledWith({
			where: { fundraiserId: "fundraiser-1" },
		});
	});

	it("rejects saving teams when the fundraiser is completed", async () => {
		const txMock = {
			fundraiser: {
				updateMany: vi.fn().mockResolvedValue({ count: 0 }),
				findUnique: vi.fn().mockResolvedValue({ status: "COMPLETED" }),
			},
			fundraiserTeam: {
				deleteMany: vi.fn(),
				createMany: vi.fn(),
			},
			teamPlayer: {
				findMany: vi.fn(),
			},
			fundraiserParticipant: {
				deleteMany: vi.fn(),
			},
		};

		prismaMock.$transaction.mockImplementation(async (callback) =>
			callback(txMock),
		);

		expect(await saveFundraiserTeams("fundraiser-1", ["team-1"])).toEqual({
			ok: false,
			error:
				"Only draft fundraisers can be edited. This fundraiser is final.",
		});

		expect(txMock.fundraiserTeam.deleteMany).not.toHaveBeenCalled();
		expect(txMock.fundraiserTeam.createMany).not.toHaveBeenCalled();
		expect(txMock.fundraiserParticipant.deleteMany).not.toHaveBeenCalled();
		expect(txMock.teamPlayer.findMany).not.toHaveBeenCalled();
	});
});

describe("fundraiser team action permissions", () => {
	it("redirects parents and does not touch the database", async () => {
		asParent();

		await expectRedirect(() => addTeamToFundraiser("fundraiser-1", "team-1"));
		await expectRedirect(() =>
			removeTeamFromFundraiser("fundraiser-1", "team-1"),
		);
		await expectRedirect(() =>
			createFundraiserAndAddToTeam("team-1", { name: "X" } as never),
		);
		await expectRedirect(() => saveFundraiserTeams("fundraiser-1", ["team-1"]));

		expect(prismaMock.$transaction).not.toHaveBeenCalled();
		expect(teamTx.fundraiserTeam.create).not.toHaveBeenCalled();
		expect(teamTx.fundraiserTeam.delete).not.toHaveBeenCalled();
	});
});
