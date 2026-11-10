import type { Prisma, ContributionType, PaymentMethod } from "@prisma/client";

export type FundraiserFormData = {
	name: string;
	description: string;
	startDate: Date;
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



export type FundraiserParticipantWithPlayer =
	Prisma.FundraiserParticipantGetPayload<{
		include: {
			player: true;
		};
	}>;
