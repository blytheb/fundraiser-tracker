import { getFundraisers } from "@/features/fundraisers/data/fundraisers";

import PageHeader from "@/components/ui-reusable/PageHeader";
import SearchBar from "@/components/ui-reusable/SearchBar";
import AddFundraiserDialog from "@/components/forms/fundraisers/AddFundraiserDialog";
import FundraiserList from "@/features/fundraisers/FundraiserList";

type PageProps = {
	searchParams: Promise<{
		search?: string;
	}>;
};

export default async function AllFundraisersPage({ searchParams }: PageProps) {
	const { search } = await searchParams;

	const fundraisers = await getFundraisers(search);
	return (
		<div className="space-y-4 px-4">
			<PageHeader heading="Fundraiser" />
			<div className="flex gap-4">
				<SearchBar placeholder="Search Fundraisers" />
				<AddFundraiserDialog />
			</div>
			<FundraiserList fundraisers={fundraisers} />
		</div>
	);
}
