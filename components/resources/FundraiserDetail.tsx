"use client";

import { CalendarDays } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import type { Fundraiser } from "@prisma/client";

type Props = {
	fundraiser: Fundraiser;
};

export default function FundraiserDetail({ fundraiser }: Props) {
	return (
		<Card>
			<CardHeader className="flex flex-row items-center justify-between">
				<div>
					<CardTitle>{fundraiser.name}</CardTitle>
					<p className="mt-1 text-sm text-muted-foreground">
						{fundraiser.description}
					</p>
				</div>

				<Badge
					variant={fundraiser.status === "ACTIVE" ? "default" : "secondary"}>
					{fundraiser.status}
				</Badge>
			</CardHeader>

			<CardContent>
				<div className="flex items-center gap-2 text-sm text-muted-foreground">
					<CalendarDays className="h-4 w-4" />
					<span>Starts {fundraiser.startDate.toLocaleDateString()}</span>
				</div>
			</CardContent>
		</Card>
	);
}
