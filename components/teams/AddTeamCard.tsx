import React from 'react';
import {CirclePlus} from "lucide-react";

import {
	Card,
	CardTitle,
} from "@/components/ui/card";

export default function AddTeamCard() {
  return (
		<Card className="flex items-center justify-center mx-auto w-full max-w-md overflow-hidden pt-0">
			<CirclePlus/>
			<CardTitle>Add a Team</CardTitle>
		</Card>
	);
}
