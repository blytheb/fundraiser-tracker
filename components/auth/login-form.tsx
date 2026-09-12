"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { authClient } from "@/lib/auth-client";

import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function LoginForm() {
	const router = useRouter();

	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");

	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();

		setError("");
		setLoading(true);

		const { error } = await authClient.signIn.email({
			email,
			password,
		});

		if (error) {
			setError(error.message || "Invalid email or password.");
			setLoading(false);
			return;
		}

		router.push("/teams");
		router.refresh();
	}

	return (
		<Card className="w-full max-w-md">
			<CardHeader>
				<CardTitle>Welcome back</CardTitle>

				<CardDescription>
					Sign in to your Fundraiser Tracker account.
				</CardDescription>
			</CardHeader>

			<CardContent>
				<form onSubmit={handleSubmit} className="space-y-5">
					<div className="space-y-2">
						<Label htmlFor="email">Email</Label>

						<Input
							id="email"
							type="email"
							placeholder="you@example.com"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							required
						/>
					</div>

					<div className="space-y-2">
						<div className="flex items-center justify-between">
							<Label htmlFor="password">Password</Label>

							{/* <Link
								href="/forgot-password"
								className="text-sm text-muted-foreground hover:text-primary">
								Forgot password?
							</Link> */}
						</div>

						<Input
							id="password"
							type="password"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							required
						/>
					</div>

					{error && <p className="text-sm text-destructive">{error}</p>}

					<Button type="submit" className="w-full" disabled={loading}>
						{loading ? "Signing in..." : "Sign in"}
					</Button>

					{/* <p className="text-center text-sm text-muted-foreground">
						Don&apos;t have an account?
						<Link
							href="/register"
							className="font-medium text-foreground hover:underline">
							Create one
						</Link>
					</p> */}
				</form>
			</CardContent>
		</Card>
	);
}
