import AllFundraisersLayout from "@/components/fundraisers/AllFundraisersLayout";
import { getAllFundraisers } from "@/lib/data/fundraisers";

import PageHeader from "@/components/PageHeader";
import SearchBar from "@/components/SearchBar";
import FundraiserActions from "@/components/fundraisers/FundraiserActions";
import ImageHorizontalCard from "@/components/ImageHorizontalCard";
import AddFundraiserDialog from "@/components/fundraisers/forms/AddFundraiserDialog";
import {
	Item,
	ItemActions,
	ItemContent,
	ItemDescription,
	ItemMedia,
	ItemTitle,
	ItemGroup,
} from "@/components/ui/item";
import { Button } from "@/components/ui/button";
import { BadgeCheckIcon, CalendarClock } from "lucide-react";
import Link from "next/link";

export default async function AllFundraisersPage() {
	const fundraisers = await getAllFundraisers();
	return (
		<div className="space-y-4 px-4">
			<PageHeader heading="Fundraiser" />
			<div className="flex gap-4">
				<SearchBar />
				<AddFundraiserDialog />
			</div>
			<div className="space-y-2">
				{fundraisers.length === 0 ? (
					<div className="flex flex-col w-full items-center gap-3 rounded-lg border p-3">
						No Fundraisers Found
					</div>
				) : (
					<div className="space-y-4">
						<ItemGroup>
							{fundraisers.map((fundraiser) => (
								<Item
									className="flex w-full items-center justify-center gap-6 py-2"
									key={fundraiser.id}
									variant="outline"
									size="sm">
									<ItemMedia>
										{fundraiser.status === "ACTIVE" ? (
											<CalendarClock className="size-6" />
										) : (
											<BadgeCheckIcon className="size-6" />
										)}
									</ItemMedia>
									<ItemContent>
										<Link href={`/fundraisers/${fundraiser.id}`}>
											<ItemTitle>{fundraiser.name}</ItemTitle>
											<ItemDescription> 8/19/2026 </ItemDescription>
										</Link>
									</ItemContent>
									<ItemActions>
										<FundraiserActions fundraiser={fundraiser} />
									</ItemActions>
								</Item>
							))}
						</ItemGroup>
					</div>
				)}
			</div>
		</div>
	);
}
