import { ItemGroup } from "@/components/ui/item";
import FundraiserListItem from "@/components/reusable/FundraiserListItem";
import type { Fundraiser } from "@prisma/client";

type ListProps = {
	teamId: string;
	fundraisers: Fundraiser[];
};

export default function TeamFundraiserList({ fundraisers }: ListProps) {
	if (fundraisers.length === 0) {
		return (
			<div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
				No fundraisers assigned to this team yet.
			</div>
		);
	}

	return (
		<ItemGroup>
			{fundraisers.map((fundraiser) => (
				<FundraiserListItem key={fundraiser.id} fundraiser={fundraiser} />
			))}
		</ItemGroup>
	);
}
