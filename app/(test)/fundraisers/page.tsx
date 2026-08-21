import AllFundraisersLayout from "@/components/fundraisers/AllFundraisersLayout";
import { getAllFundraisers } from "@/lib/data/fundraisers";

import PageHeader from "@/components/PageHeader";
import SearchBar from "@/components/SearchBar";
import FundraiserActions from "@/components/fundraisers/FundraiserActions";
import ImageHorizontalCard from "@/components/ImageHorizontalCard";
import AddFundraiserDialog from "@/components/fundraisers/forms/AddFundraiserDialog";

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
						{fundraisers.map((fundraiser) => (
							<ImageHorizontalCard
								key={fundraiser.id}
								heading={fundraiser.name}
								subheading={fundraiser.startDate.toLocaleDateString()}
								actions={<FundraiserActions fundraiser={fundraiser} />}
								href={`/fundraisers/${fundraiser.id}`}
							/>
						))}
					</div>
				)}
			</div>
		</div>
	);
}
