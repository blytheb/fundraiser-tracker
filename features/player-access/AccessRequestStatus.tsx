import { AccessRequestStatus as AccessRequestStatusType } from "@prisma/client";

type AccessRequestStatusProps = {
	status: AccessRequestStatusType;
};

const statusStyles: Record<AccessRequestStatusType, string> = {
	PENDING: "bg-yellow-100 text-yellow-800",
	APPROVED: "bg-green-100 text-green-800",
	REJECTED: "bg-red-100 text-red-800",
	CANCELLED: "bg-gray-100 text-gray-800",
};

const statusLabels: Record<AccessRequestStatusType, string> = {
	PENDING: "Pending review",
	APPROVED: "Approved",
	REJECTED: "Rejected",
	CANCELLED: "Canceled",
};

export function AccessRequestStatus({ status }: AccessRequestStatusProps) {
	return (
		<span
			className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${statusStyles[status]}`}>
			{statusLabels[status]}
		</span>
	);
}
