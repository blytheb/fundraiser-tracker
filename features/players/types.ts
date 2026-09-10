import type { Prisma } from "@prisma/client";

export type PlayerFormData = {
	firstName: string;
	lastName: string;
	status: boolean;
	imageUrl?: string;
};

export type PlayerWithTeams = Prisma.PlayerGetPayload<{
	include: {
		teams: {
			include: {
				team: true;
			};
		};
	};
}>;

export type PlayerWithFundraisers = Prisma.PlayerGetPayload<{
	include: {
		fundraiserParticipants: {
			include: {
				fundraiser: true;
			};
		};
	};
}>;
