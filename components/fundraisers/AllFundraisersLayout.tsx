"use client";

import { useState } from "react";
import { FundraiserList } from "@/components/fundraisers/FundraiserList";
import AddFundraiserDialog from "@/components/forms/AddFundraiserDialog";

import FundraiserTable from "@/components/fundraisers/FundraiserTable";
import { mockFundraisers } from "@/lib/mock-data/fundraisers";

import type { Fundraiser } from "@/types/fundraisers";

type LayoutProps = {
	initialFundraisers: Fundraiser[];
};

export default function AllFundraisersLayout({
	initialFundraisers,
}: LayoutProps) {
	const [fundraisers, setFundraisers] = useState(initialFundraisers);

	return (
		<div>
			<div className="p-6">
				<div className="mb-6 flex items-center justify-between">
					<div>
						<h1 className="text-2xl font-bold">Fundraisers</h1>
						<p className="text-muted-foreground">All Menehune fundraisers</p>
					</div>

					<AddFundraiserDialog />
				</div>

				{/* <div className="rounded-lg border">
						<div className="p-6 text-center text-muted-foreground">
							No fundraisers have been created yet.
						</div>
					</div> */}
				<FundraiserTable fundraisers={fundraisers} />
			</div>
		</div>
	);
}
