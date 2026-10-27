type AccessRequestStatusProps = {
	status: "PENDING" | "APPROVED" | "REJECTED";
};

const statusStyles = {
	PENDING: "bg-yellow-100 text-yellow-800",
	APPROVED: "bg-green-100 text-green-800",
	REJECTED: "bg-red-100 text-red-800",
};

const statusLabels = {
	PENDING: "Pending review",
	APPROVED: "Approved",
	REJECTED: "Rejected",
};

export function AccessRequestStatus({ status }: AccessRequestStatusProps) {
	return (
		<span
			className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${statusStyles[status]}`}>
			{statusLabels[status]}
		</span>
	);
}
