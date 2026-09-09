"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { calculateEqualDistribution } from "@/features/fundraisers/actions/fundraiserDistribution";

type Props = {
	fundraiserId: string;
	totalRaised: number;
};

export default function CalculateDistributionButton({
	fundraiserId,
	totalRaised,
}: Props) {
	const router = useRouter();
	const [isPending, startTransition] = useTransition();

	function handleCalculate() {
		startTransition(async () => {
			await calculateEqualDistribution(fundraiserId, totalRaised);
			router.refresh();
		});
	}

	return (
		<Button onClick={handleCalculate} disabled={isPending}>
			{isPending ? "Calculating..." : "Calculate"}
		</Button>
	);
}
