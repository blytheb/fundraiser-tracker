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

export function RegisterForm() {
	const router = useRouter();

	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");

	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();

		setError("");
		setLoading(true);

		const { error } = await authClient.signUp.email({
			name,
			email,
			password,
		});

		if (error) {
			setError(error.message || "Unable to create account.");
			setLoading(false);
			return;
		}

		router.push("/onboarding");
		router.refresh();
	}

	return (
		<Card className="w-full max-w-md">
			<CardHeader>
				<CardTitle>Create anaccount</CardTitle>

				<CardDescription>
					Create your Fundraiser Tracker account.
				</CardDescription>
			</CardHeader>

			<CardContent>
				<form onSubmit={handleSubmit} className="space-y-5">
					<div className="space-y-2">
						<Label htmlFor="email">Name</Label>

						<Input
							id="name"
							type="text"
							value={name}
							onChange={(e) => setName(e.target.value)}
							required
						/>
					</div>
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

							<Link
								href="/forgot-password"
								className="text-sm text-muted-foreground hover:text-primary">
								Forgot password?
							</Link>
						</div>

						<Input
							id="password"
							type="password"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							required
						/>
						<p className="text-xs text-muted-foreground">
							Password must be at least 8 characters.
						</p>
					</div>
					{error && <p className="text-sm text-destructive">{error}</p>}
					<Button type="submit" className="w-full" disabled={loading}>
						{loading ? "Creating account..." : "Create account"}
					</Button>
					<p className="text-center text-sm text-muted-foreground">
						Already have an account?
						<Link
							href="/login"
							className="font-medium text-foreground hover:underline">
							Sign in
						</Link>
					</p>
				</form>
			</CardContent>
		</Card>
	);
}
