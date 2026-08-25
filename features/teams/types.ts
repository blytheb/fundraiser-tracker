import type { Prisma, TeamStatus } from "@prisma/client";

export type TeamFormData = {
	name: string;
	status: TeamStatus;
	imageUrl?: string | null;
};

export type TeamWithPlayers = Prisma.TeamGetPayload<{
	include: {
		players: {
			include: {
				player: true;
			};
		};
	};
}>;

export type TeamWithFundraisers = Prisma.TeamGetPayload<{
	include: {
		fundraiserTeams: {
			include: {
				fundraiser: true;
			};
		};
	};
}>;

export type TeamWithPlayersAndFundraisers = Prisma.TeamGetPayload<{
	include: {
		players: {
			include: {
				player: true;
			};
		};
		fundraiserTeams: {
			include: {
				fundraiser: true;
			};
		};
	};
}>;

export type TeamPlayerWithPlayer = Prisma.TeamPlayerGetPayload<{
	include: {
		player: true;
	};
}>;
