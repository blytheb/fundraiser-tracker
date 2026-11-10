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
		fundraiser: {
			findUnique: vi.fn(),
		},
		$transaction: vi.fn(),
	},
}));

vi.mock("@/lib/prisma", () => ({
	prisma: prismaMock,
}));

import { asParent, expectRedirect } from "../../helpers/auth";
import { addPlayerToFundraiser } from "@/features/fundraisers/actions/add-player-to-fundraiser";
import { removePlayerFromFundraiser } from "@/features/fundraisers/actions/remove-player-from-fundraiser";
import { saveFundraiserParticipants } from "@/features/fundraisers/actions/save-fundraiser-participants";

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
		prismaMock.fundraiser.findUnique.mockResolvedValue({
			status: "DRAFT",
		});

		const result = await addPlayerToFundraiser("fundraiser-1", "player-1");

		expect(prismaMock.fundraiserParticipant.create).toHaveBeenCalledWith({
			data: {
				fundraiserId: "fundraiser-1",
				playerId: "player-1",
				// every participant starts with a $0 allocation
				allocations: {
					create: { amount: 0, status: "ACTIVE" },
				},
			},
		});
		expect(result).toEqual({ ok: true, data: participant });
	});
	it("rejects adding a player to a completed fundraiser", async () => {
		prismaMock.fundraiser.findUnique.mockResolvedValue({
			status: "COMPLETED",
		});

		expect(await addPlayerToFundraiser("fundraiser-1", "player-1")).toEqual({
			ok: false,
			error: "Completed fundraisers cannot be edited.",
		});

		expect(prismaMock.fundraiserParticipant.create).not.toHaveBeenCalled();
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
		prismaMock.fundraiser.findUnique.mockResolvedValue({
			status: "DRAFT",
		});

		const result = await removePlayerFromFundraiser("fundraiser-1", "player-1");

		expect(prismaMock.fundraiserParticipant.delete).toHaveBeenCalledWith({
			where: {
				fundraiserId_playerId: {
					fundraiserId: "fundraiser-1",
					playerId: "player-1",
				},
			},
		});
		expect(result).toEqual({ ok: true, data: participant });
	});

	it("rejects removing a player from a completed fundraiser", async () => {
		prismaMock.fundraiser.findUnique.mockResolvedValue({
			status: "COMPLETED",
		});

		expect(await removePlayerFromFundraiser("fundraiser-1", "player-1")).toEqual({
			ok: false,
			error: "Completed fundraisers cannot be edited.",
		});

		expect(prismaMock.fundraiserParticipant.delete).not.toHaveBeenCalled();
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
			fundraiser: {
				findUnique: vi.fn().mockResolvedValue({
					status: "DRAFT",
				}),
			},
			fundraiserParticipant: {
				deleteMany: vi.fn().mockResolvedValue({ count: 0 }),
				createMany: vi.fn().mockResolvedValue({ count: 1 }),
				findMany: vi
					.fn()
					// 1st call: participants without an ACTIVE allocation
					.mockResolvedValueOnce([{ id: "participant-1" }])
					// 2nd call: the participants returned to the caller
					.mockResolvedValueOnce(participants),
			},
			fundraiserAllocation: {
				createMany: vi.fn().mockResolvedValue({ count: 1 }),
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
			where: {
				fundraiserId: "fundraiser-1",
				allocations: { none: { status: "ACTIVE" } },
			},
			select: { id: true },
		});

		// new participant gets a $0 allocation
		expect(txMock.fundraiserAllocation.createMany).toHaveBeenCalledWith({
			data: [
				{
					fundraiserParticipantId: "participant-1",
					amount: 0,
					status: "ACTIVE",
				},
			],
		});

		expect(txMock.fundraiserParticipant.findMany).toHaveBeenLastCalledWith({
			where: { fundraiserId: "fundraiser-1" },
			include: { player: true },
		});

		expect(result).toEqual({ ok: true, data: participants });
	});

	it("does not create allocations when every participant already has one", async () => {
		const txMock = {
			fundraiser: {
				findUnique: vi.fn().mockResolvedValue({ status: "DRAFT" }),
			},
			fundraiserParticipant: {
				deleteMany: vi.fn().mockResolvedValue({ count: 0 }),
				createMany: vi.fn().mockResolvedValue({ count: 0 }),
				findMany: vi
					.fn()
					.mockResolvedValueOnce([])
					.mockResolvedValueOnce([]),
			},
			fundraiserAllocation: {
				createMany: vi.fn(),
			},
		};
		prismaMock.$transaction.mockImplementation(async (callback) =>
			callback(txMock),
		);

		const result = await saveFundraiserParticipants("fundraiser-1", [
			"player-1",
		]);

		expect(result.ok).toBe(true);
		expect(txMock.fundraiserAllocation.createMany).not.toHaveBeenCalled();
	});

	it("removes all participants and skips adding players when the list is empty", async () => {
		const txMock = {
			fundraiser: {
				findUnique: vi.fn().mockResolvedValue({
					status: "DRAFT",
				}),
			},
			fundraiserParticipant: {
				deleteMany: vi.fn().mockResolvedValue({ count: 2 }),
				createMany: vi.fn(),
				findMany: vi.fn().mockResolvedValue([]),
			},
			fundraiserAllocation: {
				createMany: vi.fn(),
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
		expect(result).toEqual({ ok: true, data: [] });
	});
	it("rejects saving participants for a completed fundraiser", async () => {
		const txMock = {
			fundraiser: {
				findUnique: vi.fn().mockResolvedValue({
					status: "COMPLETED",
				}),
			},
			fundraiserParticipant: {
				deleteMany: vi.fn(),
				createMany: vi.fn(),
				findMany: vi.fn(),
			},
		};

		prismaMock.$transaction.mockImplementation(async (callback) =>
			callback(txMock),
		);

		expect(await saveFundraiserParticipants("fundraiser-1", ["player-1"])).toEqual({
			ok: false,
			error: "Completed fundraisers cannot be edited.",
		});

		expect(txMock.fundraiserParticipant.deleteMany).not.toHaveBeenCalled();
		expect(txMock.fundraiserParticipant.createMany).not.toHaveBeenCalled();
	});
});

describe("fundraiser participant action permissions", () => {
	it("redirects parents and does not touch the database", async () => {
		asParent();

		await expectRedirect(() => addPlayerToFundraiser("fundraiser-1", "player-1"));
		await expectRedirect(() =>
			removePlayerFromFundraiser("fundraiser-1", "player-1"),
		);
		await expectRedirect(() =>
			saveFundraiserParticipants("fundraiser-1", ["player-1"]),
		);

		expect(prismaMock.fundraiser.findUnique).not.toHaveBeenCalled();
		expect(prismaMock.fundraiserParticipant.create).not.toHaveBeenCalled();
		expect(prismaMock.fundraiserParticipant.delete).not.toHaveBeenCalled();
		expect(prismaMock.$transaction).not.toHaveBeenCalled();
	});
});
