import React from "react";

type HeaderProps = {
	heading: string;
	subheading: string;
};

export default function PageHeader({ heading, subheading }: HeaderProps) {
	return (
		<div className="mb-6 flex items-center justify-between">
			<div>
				<h1 className="text-2xl font-bold">{heading}</h1>
				<p className="text-muted-foreground">{subheading}</p>
			</div>
		</div>
	);
}
