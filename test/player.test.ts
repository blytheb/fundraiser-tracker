import { describe, it, expect, beforeEach } from "vitest";
import { prisma } from "@/lib/prisma";
import {
	createPlayer,
	updatePlayer,
	deletePlayer,
} from "@/lib/actions/players";

describe("Player Actions", () => {
	beforeEach(async () => {
		await prisma.fundraiser.deleteMany();
	});

	it("creates a player", async () => {
		const player = await createPlayer({
			firstName: "Test",
			lastName: "Player",
			status: true,
			imageUrl: null,
		});

		expect(player.firstName).toBe("Test");
		expect(player.lastName).toBe("Player");
		expect(player.status).toBe(true);
		expect(player.imageUrl).toBeNull();
	});

	it("updates a player", async () => {
		const player = await createPlayer({
			firstName: "Test",
			lastName: "Player",
			status: true,
			imageUrl: null,
		});

		const updatedPlayer = await updatePlayer(player.id, {
			firstName: "Updated Test",
			lastName: "Updated Player",
			status: false,
			imageUrl: "https://example.com/player.jpg",
		});

		expect(updatedPlayer.firstName).toBe("Updated Test");
		expect(updatedPlayer.lastName).toBe("Updated Player");
		expect(updatedPlayer.status).toBe(false);
		expect(updatedPlayer.imageUrl).toBe("https://example.com/player.jpg");
	});

	it("deletes a player", async () => {
		const player = await createPlayer({
			firstName: "Test",
			lastName: "Player",
			status: true,
			imageUrl: null,
		});

		await deletePlayer(player.id);

		const deletedPlayer = await prisma.player.findUnique({
			where: {
				id: player.id,
			},
		});

		expect(deletedPlayer).toBeNull();
	});
});
