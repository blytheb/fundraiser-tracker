type InfoCardProps = {
	icon?: string;
	name: string;
	description?: string;
	actions?: React.ReactNode;
};

export default function InfoCard({
	icon,
	name,
	description,
	actions,
}: InfoCardProps) {
	return (
		<div className="flex w-full items-center gap-3 rounded-lg border p-3">
			{/* Image */}
			<div className="shrink-0">
				{icon ? (
					<img
						src={icon}
						alt=""
						className="h-12 w-12 rounded-xl object-cover"
					/>
				) : (
					<div className="h-12 w-12 rounded-md bg-muted" />
				)}
			</div>

			{/* Details */}
			<div className="min-w-0 flex-1">
				<h3 className="truncate font-medium">{name}</h3>

				{description && (
					<p className="truncate text-sm text-muted-foreground">
						{description}
					</p>
				)}
			</div>

			{/* Actions */}
			{actions && <div className="shrink-0">{actions}</div>}
		</div>
	);
}
