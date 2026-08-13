import React from "react";

import AddFundraiserDialog from "@/components/forms/AddFundraiserDialog";

import FundraiserTable from "@/components/fundraisers/FundraiserTable";
import { mockFundraisers } from "@/lib/mock-data/fundraisers";

export function FundraiserList() {
	return (
		<>
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
				<FundraiserTable fundraisers={mockFundraisers} />
			</div>
		</>
	);
}
