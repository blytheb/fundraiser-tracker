import { getFundraisers } from "@/features/fundraisers/data/fundraisers";

import PageHeader from "@/components/ui-reusable/PageHeader";
import SearchBar from "@/components/ui-reusable/SearchBar";
import AddFundraiserDialog from "@/components/forms/fundraisers/AddFundraiserDialog";
import FundraiserList from "@/features/fundraisers/FundraiserList";

export default async function AllFundraisersPage() {
	const fundraisers = await getFundraisers();
	return (
		<div className="space-y-4 px-4">
			<PageHeader heading="Fundraiser" />
			<div className="flex gap-4">
				<SearchBar />
				<AddFundraiserDialog />
			</div>
			<FundraiserList fundraisers={fundraisers} />
		</div>
	);
}
