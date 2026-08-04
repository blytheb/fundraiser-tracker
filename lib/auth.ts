import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";

export const auth = betterAuth({
	baseUrl: process.env.BETTER_AUTH_URL || "http://localhost:3000",
	trustedOrigins: [process.env.BETTER_AUTH_URL, "http://localhost:3000"],
	database: prismaAdapter(prisma, { provider: "postgresql" }),

	emailAndPassword: { enabled: true },
});
