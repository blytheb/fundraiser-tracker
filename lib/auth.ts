// server better auth config

import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";

export const auth = betterAuth({
	database: prismaAdapter(prisma, {
		provider: "postgresql",
	}),

	emailAndPassword: {
		enabled: true,
	},

	baseURL: process.env.BETTER_AUTH_URL,

	secret: process.env.BETTER_AUTH_SECRET,

	trustedOrigins: [
		"http://localhost:3000",
		process.env.BETTER_AUTH_URL!,
		"https://fundraiser-tracker-git-feature-distribution-blythe3.vercel.app/",
	],
});
