import react from "React";
import Image from "next/image";

type InfoCardProps = {
	image?: string;
	heading: string;
	subheading?: string;
	actions?: React.ReactNode;
};

export default function ImageHorizontalCrad({
	image,
	heading,
	subheading,
	actions,
}: InfoCardProps) {
	return (
		<div className="flex w-full items-center gap-3 rounded-lg border p-3 lg:flex-col">
			{/* Image */}
			<div className="shrink-0">
				{image ? (
					<Image
						src={image}
						alt=""
						width={12}
						height={12}
						className="h-12 w-12 rounded-md object-cover"
					/>
				) : (
					<div className="h-12 w-12 rounded-md bg-muted" />
				)}
			</div>

			{/* Details */}
			<div className="min-w-0 flex-1">
				<h3 className="truncate font-medium">{heading}</h3>

				{subheading && (
					<p className="truncate text-sm text-muted-foreground">{subheading}</p>
				)}
			</div>

			{/* Actions */}
			{actions && <div className="shrink-0">{actions}</div>}
		</div>
	);
}
