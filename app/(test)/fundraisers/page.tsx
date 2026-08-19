import AllFundraisersLayout from "@/components/fundraisers/AllFundraisersLayout";
import { getAllFundraisers } from "@/lib/data/fundraisers";

// import { mockFundraisers } from "@/lib/mock-data/fundraisers.ts";

export default async function AllFundraisersPage() {
	const fundraisers = await getAllFundraisers();
	return (
		<>
			<AllFundraisersLayout fundraisers={fundraisers} />
		</>
	);
}
