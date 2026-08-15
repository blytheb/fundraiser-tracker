import React from "react";
import { Badge } from "@/components/ui/badge";
import { TableCell, TableRow } from "@/components/ui/table";
import Link from "next/link";
import FundraiserActions from "@/components/fundraisers/FundraiserActions";

type FundraiserRowProps = {
	fundraiser: Fundrlaiser;
};

export default function FundraiserRow({ fundraiser }: FundraiserRowProps) {
	return (
		<TableRow>
			<TableCell>{fundraiser.startDate.toLocaleDateString()}</TableCell>
			<TableCell>
				<Link
					href={`/test/${fundraiser.id}`}
					className="font-medium hover:underline">
					{fundraiser.name}
				</Link>
			</TableCell>
			<TableCell>
				<div className="flex flew-wrap gap-1">
					{fundraiser.teams.map((team) => (
						<Badge key={team.id} variant="secondary">
							{team.name}
						</Badge>
					))}
				</div>
			</TableCell>
			<TableCell>$0.00</TableCell>
			<TableCell>
				<Badge variant="secondary">{fundraiser.status}</Badge>
			</TableCell>
			<TableCell>
				<FundraiserActions
					fundraiser={fundraiser}
					// onEditFundraiser={}
					// onDeleteFundraiser={}
				/>
			</TableCell>
		</TableRow>
	);
}
