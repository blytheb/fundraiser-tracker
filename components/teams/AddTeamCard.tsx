import React from 'react';
import {CirclePlus} from "lucide-react";

import { Card, CardContent, CardTitle } from "@/components/ui/card";

export default function AddTeamCard() {
	return (
		<Card className="flex h-[250px] min-h-full w-full cursor-pointer items-center justify-center overflow-hidden">
			<CardContent className="flex flex-col items-center gap-2">
				<CirclePlus className="h-10 w-10" />

				<CardTitle>Add a Team</CardTitle>
			</CardContent>
		</Card>
	);
}
