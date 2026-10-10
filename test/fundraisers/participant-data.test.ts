import { beforeEach, describe, expect, it, vi } from "vitest";

const { prismaMock } = vi.hoisted(() => ({
	prismaMock: {
		fundraiserParticipant: {
			findMany: vi.fn(),
		},
	},
}));

vi.mock("@/lib/prisma", () => ({
	prisma: prismaMock,
}));

import { getFundraiserParticipants } from "@/features/fundraisers/data/fundraiserParticipants";

beforeEach(() => {
	vi.clearAllMocks();
});

describe("getFundraiserParticipants", () => {
	it("retrieves participants for the fundraiser with player information", async () => {
		const participants = [
			{
				id: "participant-1",
				fundraiserId: "fundraiser-1",
				playerId: "player-1",
				player: {
					id: "player-1",
					firstName: "Alex",
					lastName: "Smith",
				},
			},
		];

		prismaMock.fundraiserParticipant.findMany.mockResolvedValue(participants);

		const result = await getFundraiserParticipants("fundraiser-1");

		expect(prismaMock.fundraiserParticipant.findMany).toHaveBeenCalledWith({
			where: {
				fundraiserId: "fundraiser-1",
			},
			include: {
				player: true,
			},
		});

		expect(result).toEqual(participants);
	});

	it("returns an empty array when no participants exist", async () => {
		prismaMock.fundraiserParticipant.findMany.mockResolvedValue([]);

		const result = await getFundraiserParticipants("fundraiser-1");

		expect(result).toEqual([]);
	});
});
