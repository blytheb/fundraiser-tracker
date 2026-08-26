import type {
	Prisma,
	FundraiserDistribution,
	FundraiserStatus,
} from "@prisma/client";

export type FundraiserFormData = {
	name: string;
	description: string;
	startDate: Date;
	status: FundraiserStatus;
	distributionMethod: FundraiserDistribution;
};

export type FundraiserWithTeams = Prisma.FundraiserGetPayload<{
	include: {
		teams: {
			include: {
				team: true;
			};
		};
	};
}>;

export type FundraiserWithParticipants = Prisma.FundraiserGetPayload<{
	include: {
		participants: {
			include: {
				player: true;
			};
		};
	};
}>;

export type FundraiserWithFunds = Prisma.FundraiserGetPayload<{
	include: {
		funds: true;
	};
}>;
