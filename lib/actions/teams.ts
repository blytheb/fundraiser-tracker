"use server";

import { prisma } from "@/lib/prisma";

export async function createTeam(data: {
	name: data.name;
	status: data.status;
	imageUrl?: data.imageUrl | "";
}) {
	return prisma.team.create({ data });
}
