import { describe, it, expect, beforeEach } from "vitest";
import { prisma } from "@/lib/prisma";
import {
	addTeamToFundraiser,
	removeTeamFromFundraiser,
	saveFundraiserTeams,
} from "@/lib/actions/fundraiserTeams";

describe("FundraiserTeam actions", () => {
	beforeEach(async () => {
		await prisma.fundraiserTeam.deleteMany();
		await prisma.fundraiser.deleteMany();
		await prisma.team.deleteMany();
	});

	it("adds a team to a fundraiser", async () => {
		const fundraiser = await prisma.fundraiser.create({
			data: {
				name: "Test Fundraiser",
				description: "Test description",
				startDate: new Date("2026-08-20"),
				status: "ACTIVE",
			},
		});

		const team = await prisma.team.create({
			data: {
				name: "Test Team",
				status: "IN_SEASON",
				imageUrl: null,
			},
		});

		const fundraiserTeam = await addTeamToFundraiser(fundraiser.id, team.id);

		expect(fundraiserTeam.teamId).toBe(team.id);
		expect(fundraiserTeam.fundraiserId).toBe(fundraiser.id);
	});

	it("removes a team to a fundraiser", async () => {
		const fundraiser = await prisma.fundraiser.create({
			data: {
				name: "Test Fundraiser",
				description: "Test description",
				startDate: new Date("2026-08-20"),
				status: "ACTIVE",
			},
		});

		const team = await prisma.team.create({
			data: {
				name: "Test Team",
				status: "IN_SEASON",
				imageUrl: null,
			},
		});

		await addTeamToFundraiser(fundraiser.id, team.id);
		await removeTeamFromFundraiser(fundraiser.id, team.id);

		const fundraiserTeam = await prisma.fundraiserTeam.findUnique({
			where: {
				fundraiserId_teamId: {
					fundraiserId: fundraiser.id,
					teamId: team.id,
				},
			},
		});

		expect(fundraiserTeam).toBeNull();
	});

	it("replaces fundraiser team list", async () => {
		const fundraiser = await prisma.fundraiser.create({
			data: {
				name: "Test Fundraiser",
				description: "Test description",
				startDate: new Date("2026-08-20"),
				status: "ACTIVE",
			},
		});

		const team1 = await prisma.team.create({
			data: {
				name: "Test Team 1",
				status: "IN_SEASON",
				imageUrl: null,
			},
		});
		const team2 = await prisma.team.create({
			data: {
				name: "Test Team 2",
				status: "IN_SEASON",
				imageUrl: null,
			},
		});
		const team3 = await prisma.team.create({
			data: {
				name: "Test Team 3",
				status: "IN_SEASON",
				imageUrl: null,
			},
		});

		await addTeamToFundraiser(fundraiser.id, team1.id);
		await addTeamToFundraiser(fundraiser.id, team2.id);

		await saveFundraiserTeams(fundraiser.id, [team2.id, team3.id]);

		const roster = await prisma.fundraiserTeam.findMany({
			where: {
				fundraiserId: fundraiser.id,
			},
		});

		expect(roster).toHaveLength(2);
		expect(roster.map((item) => item.teamId)).toEqual(
			expect.arrayContaining([team2.id, team3.id]),
		);
	});

	it("does not allow the same team to be added twice", async () => {
		const fundraiser = await prisma.fundraiser.create({
			data: {
				name: "Test Fundraiser",
				description: "Test description",
				startDate: new Date("2026-08-20"),
				status: "ACTIVE",
			},
		});
		const team1 = await prisma.team.create({
			data: {
				name: "Test Team 1",
				status: "IN_SEASON",
				imageUrl: null,
			},
		});

		await addTeamToFundraiser(fundraiser.id, team1.id);

		await expect(
			addTeamToFundraiser(fundraiser.id, team1.id),
		).rejects.toThrow();
	});
});
