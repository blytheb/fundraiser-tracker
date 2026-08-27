import type { Prisma } from "@/prisma/client";

export type PlayerformData = {
	firstName: string;
	lastName: string;
	status: TeamStatus;
	imageUrl?: string;
};

export type PlayerWithTeams = Prisma.PlayerGetPayLoad<{
	include: {
		teams: {
			include: {
				team: true;
			};
		};
	};
}>;

export type PlayerWithFundraisers = Prisma.PlayerGetPayLoad<{
	include: {
		fundraiserParticipants: {
			include: {
				fundraiser: true;
			};
		};
	};
}>;
