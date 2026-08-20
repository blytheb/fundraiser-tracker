import { describe, it, expect, beforeEach } from "vitest";
import { prisma } from "@/lib/prisma";
import {
	addPlayerToFundraiser,
	removePlayerFromFundraiser,
	saveFundraiserParticipants,
} from "@/lib/actions/fundraiserParticipants";

describe("FundraiserParticipants actions", () => {
	beforeEach(async () => {
		await prisma.fundraiserParticipant.deleteMany();
		await prisma.fundraiser.deleteMany();
		await prisma.player.deleteMany();
	});

	it("adds a player to a fundraiser", async () => {
		const fundraiser = await prisma.fundraiser.create({
			data: {
				name: "Test Fundraiser",
				description: "Test description",
				startDate: new Date("2026-08-20"),
				status: "ACTIVE",
			},
		});
		const player = await prisma.player.create({
			data: {
				firstName: "Test",
				lastName: "Player",
				status: true,
				imageUrl: null,
			},
		});

		const fundraiserParticipant = await addPlayerToFundraiser(
			fundraiser.id,
			player.id,
		);

		expect(fundraiserParticipant.playerId).toBe(player.id);
		expect(fundraiserParticipant.fundraiserId).toBe(fundraiser.id);
	});

	it("removes a player to a fundraiser", async () => {
		const fundraiser = await prisma.fundraiser.create({
			data: {
				name: "Test Fundraiser",
				description: "Test description",
				startDate: new Date("2026-08-20"),
				status: "ACTIVE",
			},
		});

		const player = await prisma.player.create({
			data: {
				firstName: "Test",
				lastName: "Player",
				status: true,
				imageUrl: null,
			},
		});

		await addPlayerToFundraiser(fundraiser.id, player.id);
		await removePlayerFromFundraiser(fundraiser.id, player.id);

		const fundraiserParticipant = await prisma.fundraiserParticipant.findUnique(
			{
				where: {
					fundraiserId_playerId: {
						fundraiserId: fundraiser.id,
						playerId: player.id,
					},
				},
			},
		);

		expect(fundraiserParticipant).toBeNull();
	});

	it("replaces fundraiser participant list", async () => {
		const fundraiser = await prisma.fundraiser.create({
			data: {
				name: "Test Fundraiser",
				description: "Test description",
				startDate: new Date("2026-08-20"),
				status: "ACTIVE",
			},
		});

		const player1 = await prisma.player.create({
			data: {
				firstName: "one",
				lastName: "Player",
				status: true,
				imageUrl: null,
			},
		});
		const player2 = await prisma.player.create({
			data: {
				firstName: "two",
				lastName: "Player",
				status: true,
				imageUrl: null,
			},
		});
		const player3 = await prisma.player.create({
			data: {
				firstName: "three",
				lastName: "Player",
				status: true,
				imageUrl: null,
			},
		});

		await addPlayerToFundraiser(fundraiser.id, player1.id);
		await addPlayerToFundraiser(fundraiser.id, player2.id);

		await saveFundraiserParticipants(fundraiser.id, [player2.id, player3.id]);

		const roster = await prisma.fundraiserParticipant.findMany({
			where: {
				fundraiserId: fundraiser.id,
			},
		});

		expect(roster).toHaveLength(2);
		expect(roster.map((item) => item.playerId)).toEqual(
			expect.arrayContaining([player2.id, player3.id]),
		);
	});

	it("does not allow the same player to be added twice", async () => {
		const fundraiser = await prisma.fundraiser.create({
			data: {
				name: "Test Fundraiser",
				description: "Test description",
				startDate: new Date("2026-08-20"),
				status: "ACTIVE",
			},
		});
		const player1 = await prisma.player.create({
			data: {
				firstName: "one",
				lastName: "Player",
				status: true,
				imageUrl: null,
			},
		});

		await addPlayerToFundraiser(fundraiser.id, player1.id);

		await expect(
			addPlayerToFundraiser(fundraiser.id, player1.id),
		).rejects.toThrow();
	});
});
