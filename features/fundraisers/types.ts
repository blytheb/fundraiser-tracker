import type { Prisma, ContributionType, PaymentMethod } from "@prisma/client";

export type FundraiserFormData = {
	name: string;
	description: string;
	startDate: Date;
	isCompleted: boolean;
	isPublished: boolean;
};

export type FundraiserContributionListItem = {
	id: string;
	amount: number;
	paymentMethod: PaymentMethod;
	source: ContributionType;
	date: Date;
	description: string | null;
	fundraiserId: string;
	createdAt: Date;
	updatedAt: Date;
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

export type FundraiserParticipantWithPlayer =
	Prisma.FundraiserParticipantGetPayload<{
		include: {
			player: true;
		};
	}>;
