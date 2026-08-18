"use client";

import AddFundraiserDialog from "@/components/forms/AddFundraiserDialog";
// import PlayerTable from "@/components/players/PlayerTable";

import type { Fundraiser } from "@/types/fundraisers";

type LayoutProps = {
	fundraiser: Fundraiser[];
};

export default function AllFundraisersLayout({ fundraiser }: LayoutProps) {
	return (
		<div className="p-6">
			<div className="mb-6 flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-bold">Fundraisers</h1>
					<p className="text-muted-foreground">All Menehune Fundraisers</p>
				</div>
				<AddFundraiserDialog />
			</div>
			{/* <PlayerTable players={players} /> */}
		</div>
	);
}
