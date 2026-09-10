"use client";

import AddFundraiserDialog from "@/components/forms/fundraisers/AddFundraiserDialog";
import FundraiserTable from "@/components/resources/FundraiserTable";

import type { Fundraiser } from "@prisma/client";

type LayoutProps = {
	fundraisers: Fundraiser[];
};

export default function AllFundraisersLayout({ fundraisers }: LayoutProps) {
	return (
		<div className="p-6">
			<div className="mb-6 flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-bold">Fundraisers</h1>
					<p className="text-muted-foreground">All Menehune Fundraisers</p>
				</div>
				<AddFundraiserDialog />
			</div>
			<FundraiserTable fundraisers={fundraisers} />
		</div>
	);
}
