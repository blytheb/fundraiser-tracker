import type { FundraiserStatus } from "@prisma/client";
import { FUNDRAISER_STATUS_LABELS } from "@/lib/labels";

const STATUS_STYLES: Record<FundraiserStatus, string> = {
	DRAFT:
		"border-slate-200 bg-slate-100 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300",
	COMPLETED:
		"border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-300",
	PUBLISHED:
		"border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-300",
};

export default function FundraiserStatusBadge({
	status,
}: {
	status: FundraiserStatus;
}) {
	return (
		<span
			className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${STATUS_STYLES[status]}`}>
			<span className="mr-1.5 size-1.5 rounded-full bg-current" />
			{FUNDRAISER_STATUS_LABELS[status]}
		</span>
	);
}
