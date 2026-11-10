// Human-readable labels for database enum values.
// `import type` keeps Prisma out of client bundles; `satisfies` makes TypeScript
// error here if an enum value is added to the schema without a label.
import type {
	ContributionType,
	FundraiserStatus,
	PaymentMethod,
	TeamStatus,
} from "@prisma/client";

export const FUNDRAISER_STATUS_LABELS = {
	DRAFT: "Draft",
	COMPLETED: "Completed",
	PUBLISHED: "Published",
} as const satisfies Record<FundraiserStatus, string>;

export const CONTRIBUTION_SOURCE_LABELS = {
	SALES: "Sales",
	EVENT_PROFIT: "Event Profit",
	TIPS: "Tips",
	OTHER: "Other",
} as const satisfies Record<ContributionType, string>;

export const PAYMENT_METHOD_LABELS = {
	CASH: "Cash",
	CHECK: "Check",
	VENMO: "Venmo",
	OTHER: "Other",
} as const satisfies Record<PaymentMethod, string>;

export const TEAM_STATUS_LABELS = {
	IN_SEASON: "In season",
	SEASON_ENDED: "Season ended",
} as const satisfies Record<TeamStatus, string>;
