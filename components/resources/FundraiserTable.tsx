import React from "react";
import {
	Table,
	TableBody,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import FundraiserRow from "@/components/resources/FundraiserRow";
import type { Fundraiser } from "@prisma/client";

type FundraiserTableProps = {
	fundraisers: Fundraiser[];
};

export default function FundraiserTable({ fundraisers }: FundraiserTableProps) {
	return (
		<>
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead>Date</TableHead>
						<TableHead>Status</TableHead>
						<TableHead>Fundraiser Name</TableHead>
						<TableHead>Teams</TableHead>
						<TableHead>Amount</TableHead>
						<TableHead className="text-right">Actions</TableHead>
					</TableRow>
				</TableHeader>

				<TableBody>
					{fundraisers.map((fundraiser) => (
						<FundraiserRow key={fundraiser.id} fundraiser={fundraiser} />
					))}
				</TableBody>
			</Table>
		</>
	);
}
