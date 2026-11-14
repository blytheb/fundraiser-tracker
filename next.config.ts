import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	// v1 fundraiser pages were replaced by team transactions
	async redirects() {
		return [
			{ source: "/admin/fundraisers", destination: "/admin/transactions", permanent: true },
			{ source: "/admin/fundraisers/:path*", destination: "/admin/transactions", permanent: true },
		];
	},
	/* config options here */
	images: {
		remotePatterns: [
			{
				protocol: "https",
				hostname: "robohash.org",
			},
			{
				protocol: "http",
				hostname: "robohash.org",
			},
		],
	},
};

export default nextConfig;
