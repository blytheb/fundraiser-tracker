import { beforeEach, describe, expect, it, vi } from "vitest";

const { prismaMock } = vi.hoisted(() => ({
	prismaMock: {
		fundraiserParticipant: {
			create: vi.fn(),
			delete: vi.fn(),
			deleteMany: vi.fn(),
			createMany: vi.fn(),
			findMany: vi.fn(),
		},
		$transaction: vi.fn(),
	},
}));

vi.mock("@/lib/prisma", () => ({
	prisma: prismaMock,
}));

import {
	addPlayerToFundraiser,
	removePlayerFromFundraiser,
	saveFundraiserParticipants,
} from "@/features/fundraisers/actions/fundraiserParticipants";

beforeEach(() => {
	vi.clearAllMocks();
});

describe("addPlayerToFundraiser", () => {
	it("adds a player to a fundraiser", async () => {
		const participant = {
			id: "participant-1",
			fundraiserId: "fundraiser-1",
			playerId: "player-1",
		};

		prismaMock.fundraiserParticipant.create.mockResolvedValue(participant);

		const result = await addPlayerToFundraiser("fundraiser-1", "player-1");

		expect(prismaMock.fundraiserParticipant.create).toHaveBeenCalledWith({
			data: {
				fundraiserId: "fundraiser-1",
				playerId: "player-1",
			},
		});
		expect(result).toEqual(participant);
	});
});

describe("removePlayerFromFundraiser", () => {
	it("removes a player from a fundraiser", async () => {
		const participant = {
			id: "participant-1",
			fundraiserId: "fundraiser-1",
			playerId: "player-1",
		};

		prismaMock.fundraiserParticipant.delete.mockResolvedValue(participant);

		const result = await removePlayerFromFundraiser("fundraiser-1", "player-1");

		expect(prismaMock.fundraiserParticipant.delete).toHaveBeenCalledWith({
			where: {
				fundraiserId_playerId: {
					fundraiserId: "fundraiser-1",
					playerId: "player-1",
				},
			},
		});
		expect(result).toEqual(participant);
	});
});

describe("saveFundraiserParticipants", () => {
	it("saves selected players and returns current participants", async () => {
		const participants = [
			{
				id: "participant-1",
				fundraiserId: "fundraiser-1",
				playerId: "player-1",
				player: { id: "player-1", firstName: "Alex" },
			},
		];

		const txMock = {
			fundraiserParticipant: {
				deleteMany: vi.fn().mockResolvedValue({ count: 0 }),
				createMany: vi.fn().mockResolvedValue({ count: 1 }),
				findMany: vi.fn().mockResolvedValue(participants),
			},
		};

		prismaMock.$transaction.mockImplementation(async (callback) =>
			callback(txMock),
		);

		const result = await saveFundraiserParticipants("fundraiser-1", [
			"player-1",
		]);

		expect(txMock.fundraiserParticipant.deleteMany).toHaveBeenCalledWith({
			where: {
				fundraiserId: "fundraiser-1",
				playerId: { notIn: ["player-1"] },
			},
		});

		expect(txMock.fundraiserParticipant.createMany).toHaveBeenCalledWith({
			data: [{ fundraiserId: "fundraiser-1", playerId: "player-1" }],
			skipDuplicates: true,
		});

		expect(txMock.fundraiserParticipant.findMany).toHaveBeenCalledWith({
			where: { fundraiserId: "fundraiser-1" },
			include: { player: true },
		});

		expect(result).toEqual(participants);
	});

	it("removes all participants and skips adding players when the list is empty", async () => {
		const txMock = {
			fundraiserParticipant: {
				deleteMany: vi.fn().mockResolvedValue({ count: 2 }),
				createMany: vi.fn(),
				findMany: vi.fn().mockResolvedValue([]),
			},
		};

		prismaMock.$transaction.mockImplementation(async (callback) =>
			callback(txMock),
		);

		const result = await saveFundraiserParticipants("fundraiser-1", []);

		expect(txMock.fundraiserParticipant.deleteMany).toHaveBeenCalledWith({
			where: {
				fundraiserId: "fundraiser-1",
				playerId: { notIn: [] },
			},
		});

		expect(txMock.fundraiserParticipant.createMany).not.toHaveBeenCalled();
		expect(result).toEqual([]);
	});
});
