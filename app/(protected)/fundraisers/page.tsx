import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { getFundraisers } from "@/features/fundraisers/data/fundraisers";

import PageHeader from "@/components/reusable/PageHeader";
import SearchBar from "@/components/reusable/SearchBar";
import AddFundraiserDialog from "@/components/forms/fundraisers/AddFundraiserDialog";
import FundraiserList from "@/features/fundraisers/FundraiserList";

type PageProps = {
	searchParams: Promise<{
		search?: string;
	}>;
};

export default async function AllFundraisersPage({ searchParams }: PageProps) {
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	if (!session?.user) {
		redirect("/");
	}

	if (session.user.role !== "ADMIN") {
		redirect("/my-players");
	}

	const { search } = await searchParams;
	const fundraisers = await getFundraisers(search);

	return (
		<main className="mx-auto w-full max-w-5xl space-y-4 px-4 py-2 sm:px-6 lg:py-10">
			<PageHeader heading="Fundraiser" />
			<div className="flex gap-4">
				<SearchBar placeholder="Search Fundraisers" />
				<AddFundraiserDialog />
			</div>
			<FundraiserList fundraisers={fundraisers} />
		</main>
	);
}
