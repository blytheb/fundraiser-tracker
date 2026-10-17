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

import {
	addTeamToFundraiser,
	removeTeamFromFundraiser,
	createFundraiserAndAddToTeam,
	saveFundraiserTeams,
} from "@/features/fundraisers/actions/fundraiserTeams";

beforeEach(() => {
	vi.clearAllMocks();
});

describe("addTeamToFundraiser", () => {
	it("adds a team to a fundraiser", async () => {
		const fundraiserTeam = {
			fundraiserId: "fundraiser-1",
			teamId: "team-1",
		};

		prismaMock.fundraiserTeam.create.mockResolvedValue(fundraiserTeam);
		prismaMock.fundraiser.findUnique.mockResolvedValue({
			isCompleted: false,
		});

		const result = await addTeamToFundraiser("fundraiser-1", "team-1");

		expect(prismaMock.fundraiserTeam.create).toHaveBeenCalledWith({
			data: {
				fundraiserId: "fundraiser-1",
				teamId: "team-1",
			},
		});
		expect(result).toEqual(fundraiserTeam);
	});
	it("rejects adding a team to a completed fundraiser", async () => {
		prismaMock.fundraiser.findUnique.mockResolvedValue({
			isCompleted: true,
		});

		await expect(addTeamToFundraiser("fundraiser-1", "team-1")).rejects.toThrow(
			"Completed fundraisers cannot be edited.",
		);

		expect(prismaMock.fundraiserTeam.create).not.toHaveBeenCalled();
	});
});

describe("removeTeamFromFundraiser", () => {
	it("removes a team from a fundraiser", async () => {
		const fundraiserTeam = {
			fundraiserId: "fundraiser-1",
			teamId: "team-1",
		};

		prismaMock.fundraiserTeam.delete.mockResolvedValue(fundraiserTeam);
		prismaMock.fundraiser.findUnique.mockResolvedValue({
			isCompleted: false,
		});

		const result = await removeTeamFromFundraiser("fundraiser-1", "team-1");

		expect(prismaMock.fundraiserTeam.delete).toHaveBeenCalledWith({
			where: {
				fundraiserId_teamId: {
					fundraiserId: "fundraiser-1",
					teamId: "team-1",
				},
			},
		});

		expect(result).toEqual(fundraiserTeam);
	});
	it("rejects removing a team from a completed fundraiser", async () => {
		prismaMock.fundraiser.findUnique.mockResolvedValue({
			isCompleted: true,
		});

		await expect(
			removeTeamFromFundraiser("fundraiser-1", "team-1"),
		).rejects.toThrow("Completed fundraisers cannot be edited.");

		expect(prismaMock.fundraiserTeam.delete).not.toHaveBeenCalled();
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

		expect(result).toEqual(fundraiser);
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
				findUnique: vi.fn().mockResolvedValue({ isCompleted: false }),
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
				findUnique: vi.fn().mockResolvedValue({ isCompleted: false }),
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
				findUnique: vi.fn().mockResolvedValue({ isCompleted: true }),
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

		await expect(
			saveFundraiserTeams("fundraiser-1", ["team-1"]),
		).rejects.toThrow("Completed fundraisers cannot be edited.");

		expect(txMock.fundraiserTeam.deleteMany).not.toHaveBeenCalled();
		expect(txMock.fundraiserTeam.createMany).not.toHaveBeenCalled();
		expect(txMock.fundraiserParticipant.deleteMany).not.toHaveBeenCalled();
		expect(txMock.teamPlayer.findMany).not.toHaveBeenCalled();
	});
});
