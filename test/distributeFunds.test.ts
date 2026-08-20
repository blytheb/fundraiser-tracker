import { describe, it, expect, beforeEach } from "vitest";
import { prisma } from "@/lib/prisma";
import { distributeFunds } from "@/lib/actions/fundraisers";

describe("distributeFunds", () => {
	beforeEach(async () => {
		await prisma.fundraiserParticipant.deleteMany();
		await prisma.fundraiserTeam.deleteMany();
		await prisma.fundraiser.deleteMany();
		await prisma.teamPlayer.deleteMany();
		await prisma.player.deleteMany();
		await prisma.team.deleteMany();
	});

	it("distributes money equally among participants with 2 cents left over", async () => {
		const fundraiser = await prisma.fundraiser.create({
			data: {
				name: "Test Fundraiser",
				description: "Distribution test",
				startDate: new Date("2026-08-20"),
				status: "ACTIVE",
				totalAmount: 100.01,
				distributionMethod: "EQUAL",
			},
		});

		const player1 = await prisma.player.create({
			data: {
				firstName: "PLayer",
				lastName: "One",
				status: true,
				imageUrl: null,
			},
		});

		const player2 = await prisma.player.create({
			data: {
				firstName: "PLayer",
				lastName: "two",
				status: true,
				imageUrl: null,
			},
		});
		const player3 = await prisma.player.create({
			data: {
				firstName: "PLayer",
				lastName: "three",
				status: true,
				imageUrl: null,
			},
		});

		await prisma.fundraiserParticipant.createMany({
			data: [
				{ fundraiserId: fundraiser.id, playerId: player1.id },
				{ fundraiserId: fundraiser.id, playerId: player2.id },
				{ fundraiserId: fundraiser.id, playerId: player3.id },
			],
		});

		await distributeFunds(fundraiser.id);

		const participants = await prisma.fundraiserParticipant.findMany({
			where: {
				fundraiserId: fundraiser.id,
			},
			orderBy: {
				playerId: "asc",
			},
		});

		const amounts = participants.map((p) => p.distributionAmount.toNumber());

		expect(amounts).toEqual([33.34, 33.34, 33.33]);
	});

	it("distributes money equally among participants", async () => {
		const fundraiser = await prisma.fundraiser.create({
			data: {
				name: "Test Fundraiser",
				description: "Distribution test",
				startDate: new Date("2026-08-20"),
				status: "ACTIVE",
				totalAmount: 100,
				distributionMethod: "EQUAL",
			},
		});

		const player1 = await prisma.player.create({
			data: {
				firstName: "PLayer",
				lastName: "One",
				status: true,
				imageUrl: null,
			},
		});

		const player2 = await prisma.player.create({
			data: {
				firstName: "PLayer",
				lastName: "two",
				status: true,
				imageUrl: null,
			},
		});
		const player3 = await prisma.player.create({
			data: {
				firstName: "PLayer",
				lastName: "three",
				status: true,
				imageUrl: null,
			},
		});

		await prisma.fundraiserParticipant.createMany({
			data: [
				{ fundraiserId: fundraiser.id, playerId: player1.id },
				{ fundraiserId: fundraiser.id, playerId: player2.id },
				{ fundraiserId: fundraiser.id, playerId: player3.id },
			],
		});

		await distributeFunds(fundraiser.id);

		const participants = await prisma.fundraiserParticipant.findMany({
			where: {
				fundraiserId: fundraiser.id,
			},
			orderBy: {
				playerId: "asc",
			},
		});

		const amounts = participants.map((p) => p.distributionAmount.toNumber());

		expect(amounts).toEqual([33.34, 33.33, 33.33]);
	});

	it("throws an error when there are no particpants", async () => {
		const fundraiser = await prisma.fundraiser.create({
			data: {
				name: "Test Fundraiser",
				description: "Distribution test",
				startDate: new Date("2026-08-20"),
				status: "ACTIVE",
				totalAmount: 100,
				distributionMethod: "EQUAL",
			},
		});

		await expect(distributeFunds(fundraiser.id)).rejects.toThrow(
			"No participants found",
		);
	});

	it("throws an error when the fundraiser has no money", async () => {
		const fundraiser = await prisma.fundraiser.create({
			data: {
				name: "Empty Fundraiser",
				description: "No money",
				startDate: new Date("2026-08-20"),
				status: "ACTIVE",
				totalAmount: 0,
				distributionMethod: "EQUAL",
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

		await prisma.fundraiserParticipant.create({
			data: {
				fundraiserId: fundraiser.id,
				playerId: player.id,
			},
		});

		await expect(distributeFunds(fundraiser.id)).rejects.toThrow(
			"Fundraiser has no money to distribute",
		);
	});
});
