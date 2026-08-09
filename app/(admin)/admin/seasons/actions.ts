"use server";

import { prisma } from "@/lib/prisma";

export async function createSeason(name: string, year: number) {
	const season = await prisma.season.create({
		data: {
			name,
			startDate: new Date(`${year}-01-01`),
			endDate: new Date(`${year}-12-31`),

			status: "ACTIVE",

			organization: {
				connect: {
					id: "cmslj94lm00001vtj0oehsj0e",
				},
			},
		},
	});

	return season;
}
