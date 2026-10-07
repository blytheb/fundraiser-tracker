"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { setEqualDistribution } from "@/features/fundraisers/actions/fundraiserAllocation";

type Props = {
	fundraiserId: string;
	totalRaised: number;
};

export default function CalculateEqualDistributionButton({
	fundraiserId,
	totalRaised,
}: Props) {
	const router = useRouter();
	const [isPending, startTransition] = useTransition();

	function handleCalculate() {
		startTransition(async () => {
			await setEqualDistribution(fundraiserId);
			router.refresh();
		});
	}

	return (
		<Button onClick={handleCalculate} disabled={isPending}>
			{isPending ? "Calculating..." : "Equal Split"}
		</Button>
	);
}
