// import { describe, it, expect, beforeEach } from "vitest";
// import { prisma } from "@/lib/prisma";
// import { createTeam, updateTeam, deleteTeam } from "@/lib/actions/teams";

// describe("Team actions", () => {
// 	beforeEach(async () => {
// 		await prisma.team.deleteMany();
// 	});

// 	it("creates a team", async () => {
// 		const team = await createTeam({
// 			name: "Test Team",
// 			status: "IN_SEASON",
// 			imageUrl: null,
// 		});

// 		expect(team.name).toBe("Test Team");
// 		expect(team.status).toBe("IN_SEASON");
// 		expect(team.imageUrl).toBeNull();
// 	});

// 	it("updates a team", async () => {
// 		const team = await createTeam({
// 			name: "Old Name",
// 			status: "IN_SEASON",
// 			imageUrl: null,
// 		});

// 		const updatedTeam = await updateTeam(team.id, {
// 			name: "New Name",
// 			status: "SEASON_ENDED",
// 			imageUrl: null,
// 		});

// 		expect(updatedTeam.name).toBe("New Name");
// 		expect(updatedTeam.status).toBe("SEASON_ENDED");
// 	});

// 	it("deletes a team", async () => {
// 		const team = await createTeam({
// 			name: "Team To Delete",
// 			status: "IN_SEASON",
// 			imageUrl: null,
// 		});

// 		await deleteTeam(team.id);

// 		const deletedTeam = await prisma.team.findUnique({
// 			where: {
// 				id: team.id,
// 			},
// 		});

// 		expect(deletedTeam).toBeNull();
// 	});
// });
