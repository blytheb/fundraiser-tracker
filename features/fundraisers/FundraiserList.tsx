import React from "react";
import { ItemGroup } from "@/components/ui/item";
import FundraiserListItem from "@/features/fundraisers/FundraiserListItem";

import type { Fundraiser } from "@prisma/client";

type ListProps = {
	fundraisers: Fundraiser[];
};
export default function FundraiserList({ fundraisers }: ListProps) {
	return (
		<div className="space-y-2">
			{fundraisers.length === 0 ? (
				<div className="flex flex-col w-full items-center gap-3 rounded-lg border p-3">
					No Fundraisers Found
				</div>
			) : (
				<div className="space-y-4">
					<ItemGroup>
						{fundraisers.map((fundraiser) => (
							<FundraiserListItem key={fundraiser.id} fundraiser={fundraiser} />
						))}
					</ItemGroup>
				</div>
			)}
		</div>
	);
}
