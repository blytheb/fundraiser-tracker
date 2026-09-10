import Image from "next/image";
import Link from "next/link";
import {
	Card,
	CardFooter,
	CardHeader,
	CardAction,
	CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type InfoCardProps = {
	imageUrl?: string | null;
	imageAlt: string;
	heading: string;
	subheading?: string;
	badge?: string;
	badgeVariant?: "default" | "secondary" | "outline" | "destructive";
	actions?: React.ReactNode;
	href?: string;
	actionLabel?: string;
};

export default function InfoCard({
	imageUrl,
	imageAlt,
	heading,
	subheading,
	badge,
	badgeVariant = "secondary",
	actions,
	href,
	actionLabel = "View",
}: InfoCardProps) {
	return (
		<Card className="w-full overflow-hidden pt-0">
			<div className="flex flex-row lg:flex-col">
				{/* Image */}
				<div className="relative h-24 w-24 shrink-0 overflow-hidden sm:h-auto sm:aspect-video sm:w-full">
					{imageUrl ? (
						<Image
							src={imageUrl}
							alt={imageAlt}
							fill
							sizes="(max-width: 1024px) 96px, 25vw"
							className="object-cover"
						/>
					) : (
						<div className="flex h-full items-center justify-center bg-muted text-xs text-muted-foreground">
							No image
						</div>
					)}
				</div>

				{/* Information */}
				<CardHeader className="min-w-0 flex-1 px-4 py-3 sm:px-6 sm:py-4">
					{actions && <CardAction>{actions}</CardAction>}

					{badge && (
						<Badge variant={badgeVariant} className="w-fit">
							{badge}
						</Badge>
					)}

					<CardTitle className="truncate text-base sm:text-lg">
						{heading}
					</CardTitle>

					{subheading && (
						<p className="truncate text-sm text-muted-foreground">
							{subheading}
						</p>
					)}
				</CardHeader>
			</div>

			{/* Action */}
			{href && (
				<CardFooter className="px-4 pb-4 sm:px-6">
					<Link className="w-full" href={href}>
						{actionLabel}
					</Link>
				</CardFooter>
			)}
		</Card>
	);
}
