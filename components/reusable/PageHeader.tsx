import type { ReactNode } from "react";

type PageHeaderProps = {
	heading: string;
	subheading?: string;
	action?: ReactNode;
};

export default function PageHeader({
	heading,
	subheading,
	action,
}: PageHeaderProps) {
	return (
		<header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
			{" "}
			<div className="min-w-0">
				<h1 className="text-2xl font-bold leading-tight tracking-tight sm:text-3xl">
					{heading}
				</h1>

				{subheading && (
					<p className="mt-1 max-w-2xl text-sm text-muted-foreground sm:text-base">
						{subheading}
					</p>
				)}
			</div>
			{action && <div className="flex shrink-0 items-center">{action}</div>}
		</header>
	);
}
