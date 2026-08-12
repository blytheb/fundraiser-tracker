import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import {
	Card,
	CardAction,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

export default function TeamCard() {
  return (
		<Card className="relative mx-auto w-full max-w-md overflow-hidden pt-0">
			<div className="absolute inset-0 z-30 aspect-video bg-black/35" />
			<Image
				src="https://robohash.org/1"
				loading="eager"
				alt="Event cover"
				width={500}
				height={300}
				className="relative z-20 aspect-video w-full object-cover brightness-60 grayscale dark:brightness-40"
			/>

			<CardHeader>
				<CardAction>
					<Badge variant="secondary" className="bg-green-300">
						Active
					</Badge>
				</CardAction>
				<CardTitle>Design systems meetup</CardTitle>
			</CardHeader>
			<CardFooter>
				<Button className="w-full">View Team</Button>
			</CardFooter>
		</Card>
	);
}
