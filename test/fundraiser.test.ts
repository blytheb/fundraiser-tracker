// import { describe, it, expect, beforeEach } from "vitest";
// import { prisma } from "@/lib/prisma";
// import {
// 	createFundraiser,
// 	updateFundraiser,
// 	deleteFundraiser,
// } from "@/lib/actions/fundraisers";

// describe("Fundraiser actions", () => {
// 	beforeEach(async () => {
// 		await prisma.fundraiser.deleteMany();
// 	});

// 	it("creates a fundraisers", async () => {
// 		const fundraiser = await createFundraiser({
// 			name: "Test Fundraiser",
// 			description: "Test description",
// 			startDate: new Date("2026-08-20"),
// 			status: "ACTIVE",
// 		});

// 		expect(fundraiser.name).toBe("Test Fundraiser");
// 		expect(fundraiser.description).toBe("Test description");
// 		expect(fundraiser.status).toBe("ACTIVE");
// 		expect(fundraiser.totalAmount.toNumber()).toBe(0);
// 		expect(fundraiser.distributionMethod).toBe("EQUAL");
// 	});

// 	it("updates a fundraiser", async () => {
// 		const fundraiser = await createFundraiser({
// 			name: "Test Fundraiser",
// 			description: "Test description",
// 			startDate: new Date("2026-08-20"),
// 			status: "ACTIVE",
// 		});

// 		const updatedFundraiser = await (fundraiser.id,
// 		{
// 			name: "Updated Fundraiser",
// 			description: "Updated description",
// 			startDate: new Date("2026-08-25"),
// 			status: "COMPLETED",
// 		});

// 		expect(updatedFundraiser.name).toBe("Updated Fundraiser");
// 		expect(updatedFundraiser.description).toBe("Updated description");
// 		expect(updatedFundraiser.status).toBe("COMPLETED");
// 	});

// 	it("deletes a fundraiser", async () => {
// 		const fundraiser = await createFundraiser({
// 			name: "Test Fundraiser",
// 			description: "Test description",
// 			startDate: new Date("2026-08-20"),
// 			status: "ACTIVE",
// 		});

// 		console.log("created fundraiser:", fundraiser);
// 		await deleteFundraiser(fundraiser.id);

// 		const deletedFundraiser = await prisma.fundraiser.findUnique({
// 			where: {
// 				id: fundraiser.id,
// 			},
// 		});

// 		expect(deletedFundraiser).toBeNull();
// 	});
// });
