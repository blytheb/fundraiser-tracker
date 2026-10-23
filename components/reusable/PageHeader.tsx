import React from "react";

type PageHeaderProps = {
	heading: string;
	subheading?: string;
	action?: React.ReactNode;
};

export default function PageHeader({ heading, subheading }: PageHeaderProps) {
	return (
		<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
			<div className="min-w-0">
				<h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
					{heading}
				</h1>

				{subheading && (
					<p className="mt-1 text-sm text-muted-foreground sm:text-base">
						{subheading}
					</p>
				)}
			</div>
		</div>
	);
}
