import AllFundraisersLayout from "@/components/fundraisers/AllFundraisersLayout";
import { getAllFundraisers } from "@/lib/data/fundraisers";

export default async function AllFundraisersPage() {
	const fundraisers = await getAllFundraisers();
	return (
		<>
			<AllFundraisersLayout fundraisers={fundraisers} />
		</>
	);
}
