// import { describe, it, expect, beforeEach } from "vitest";
// import { prisma } from "@/lib/prisma";
// import {
// 	addPlayerToTeam,
// 	removePlayerFromTeam,
// 	saveTeamRoster,
// } from "@/lib/actions/teamPlayer";

// describe("TeamPlayer Actions", () => {
// 	beforeEach(async () => {
// 		await prisma.teamPlayer.deleteMany();
// 		await prisma.Team.deleteMany();
// 		await prisma.Player.deleteMany();
// 	});

// 	it("adds a player to a team", async () => {
// 		const team = await prisma.team.create({
// 			data: {
// 				name: "Test team",
// 				status: "IN_SEASON",
// 				imageUrl: null,
// 			},
// 		});

// 		const player = await prisma.player.create({
// 			data: {
// 				firstName: "Test",
// 				lastName: "Player",
// 				status: true,
// 				imageUrl: null,
// 			},
// 		});

// 		const teamPlayer = await addPlayerToTeam(team.id, player.id);

// 		expect(teamPlayer.teamId).toBe(team.id);
// 		expect(teamPlayer.playerId).toBe(player.id);
// 	});

// 	it("removes a player from a team", async () => {
// 		const team = await prisma.team.create({
// 			data: {
// 				name: "Test team",
// 				status: "IN_SEASON",
// 				imageUrl: null,
// 			},
// 		});

// 		const player = await prisma.player.create({
// 			data: {
// 				firstName: "Test",
// 				lastName: "Player",
// 				status: true,
// 				imageUrl: null,
// 			},
// 		});

// 		await addPlayerToTeam(team.id, player.id);
// 		await removePlayerFromTeam(team.id, player.id);

// 		const teamPlayer = await prisma.teamPlayer.findUnique({
// 			where: {
// 				teamId_playerId: {
// 					teamId: team.id,
// 					playerId: player.id,
// 				},
// 			},
// 		});

// 		expect(teamPlayer).toBeNull();
// 	});

// 	it("replaces team roster", async () => {
// 		const team = await prisma.team.create({
// 			data: {
// 				name: "Test team",
// 				status: "IN_SEASON",
// 				imageUrl: null,
// 			},
// 		});

// 		const player1 = await prisma.player.create({
// 			data: {
// 				firstName: "one",
// 				lastName: "Player",
// 				status: true,
// 				imageUrl: null,
// 			},
// 		});
// 		const player2 = await prisma.player.create({
// 			data: {
// 				firstName: "two",
// 				lastName: "Player",
// 				status: true,
// 				imageUrl: null,
// 			},
// 		});
// 		const player3 = await prisma.player.create({
// 			data: {
// 				firstName: "three",
// 				lastName: "Player",
// 				status: true,
// 				imageUrl: null,
// 			},
// 		});

// 		await addPlayerToTeam(team.id, player1.id);
// 		await addPlayerToTeam(team.id, player2.id);

// 		await saveTeamRoster(team.id, [player2.id, player3.id]);

// 		const roster = await prisma.teamPlayer.findMany({
// 			where: {
// 				teamId: team.id,
// 			},
// 		});

// 		expect(roster).toHaveLength(2);
// 		expect(roster.map((item) => item.playerId)).toEqual(
// 			expect.arrayContaining([player2.id, player3.id]),
// 		);
// 	});

// 	it("does not allow the same player to be added twice", async () => {
// 		const team = await prisma.team.create({
// 			data: {
// 				name: "Test team",
// 				status: "IN_SEASON",
// 				imageUrl: null,
// 			},
// 		});
// 		const player1 = await prisma.player.create({
// 			data: {
// 				firstName: "one",
// 				lastName: "Player",
// 				status: true,
// 				imageUrl: null,
// 			},
// 		});

// 		await addPlayerToTeam(team.id, player1.id);

// 		await expect(addPlayerToTeam(team.id, player1.id)).rejects.toThrow();
// 	});
// });
