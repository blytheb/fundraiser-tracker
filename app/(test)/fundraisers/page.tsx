import { getFundraisers } from "@/features/fundraisers/data/fundraisers";

import PageHeader from "@/components/PageHeader";
import SearchBar from "@/components/SearchBar";
import AddFundraiserDialog from "@/features/fundraisers/forms/AddFundraiserDialog";
import { ItemGroup } from "@/components/ui/item";
import { BadgeCheckIcon, CalendarClock } from "lucide-react";
import ListItemWithIcon from "@/components/ListItemWithIcon";

export default async function AllFundraisersPage() {
	const fundraisers = await getFundraisers();
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
								<ListItemWithIcon
									key={fundraiser.id}
									fundraiser={fundraiser}
									activeIcon={CalendarClock}
									inactiveIcon={BadgeCheckIcon}
								/>
							))}
						</ItemGroup>
					</div>
				)}
			</div>
		</div>
	);
}
