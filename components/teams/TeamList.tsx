import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Image from "next/image";

import {
	Card,
	CardAction,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

export function TeamList() {
	return (
		<>
			<div className="p-6">
				<div className="mb-6 flex items-center justify-between">
					<div>
						<h1 className="text-2xl font-bold">Seasons</h1>
						<p className="text-muted-foreground">
							Manage your fundraiser seasons.
						</p>
					</div>
				</div>

				<div className="rounded-lg border">
					<div className="p-6 text-center text-muted-foreground">
						No seasons have been created yet.
					</div>
				</div>

                <div>
                    <Card className="relative mx-auto w-full max-w-md overflow-hidden pt-0">
                        <div className="absolute inset-0 z-30 aspect-video bg-black/35" />
                        <Image
                            src="https://robohash.org/1"
                            loading="eager"
                            alt="Event cover"
                            width="500"
                            height="500"
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
                            <Button className="w-full">View Event</Button>
                        </CardFooter>
                    </Card>

                    <Card className="relative mx-auto w-full max-w-md overflow-hidden pt-0">
                        <div className="absolute inset-0 z-30 aspect-video bg-black/35" />
                        <Image
                            src="https://robohash.org/1"
                            loading="eager"
                            alt="Event cover"
                            width="500"
                            height="500"
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
                            <Button className="w-full">View Event</Button>
                        </CardFooter>
                    </Card>

                    <Card className="relative mx-auto w-full max-w-md overflow-hidden pt-0">
                        <div className="absolute inset-0 z-30 aspect-video bg-black/35" />
                        <Image
                            src="https://robohash.org/1"
                            loading="eager"
                            alt="Event cover"
                            width="500"
                            height="500"
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
                            <Button className="w-full">View Event</Button>
                        </CardFooter>
                    </Card>
                </div>
			</div>
		</>
	);
}
