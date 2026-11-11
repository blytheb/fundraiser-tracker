// Human-readable labels for database enum values.
// `import type` keeps Prisma out of client bundles; `satisfies` makes TypeScript
// error here if an enum value is added to the schema without a label.
import type {
	ContributionType,
	FundraiserStatus,
	PaymentMethod,
	TeamStatus,
	TeamTransactionStatus,
	TransactionDirection,
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

export const TEAM_TRANSACTION_STATUS_LABELS = {
	DRAFT: "Draft",
	COMPLETED: "Completed",
	PUBLISHED: "Published",
} as const satisfies Record<TeamTransactionStatus, string>;

export const DIRECTION_LABELS = {
	INCOME: "Income",
	EXPENSE: "Expense",
} as const satisfies Record<TransactionDirection, string>;

// The four kinds shown in the transactions list
export type TransactionKind =
	| "INDIVIDUAL_INCOME"
	| "INDIVIDUAL_EXPENSE"
	| "TEAM_INCOME"
	| "TEAM_EXPENSE";

export const TRANSACTION_KIND_LABELS = {
	INDIVIDUAL_INCOME: "Individual income",
	INDIVIDUAL_EXPENSE: "Individual expense",
	TEAM_INCOME: "Team income",
	TEAM_EXPENSE: "Team expense",
} as const satisfies Record<TransactionKind, string>;
