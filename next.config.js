/* eslint-disable @typescript-eslint/no-var-requires */
/** @type {import('next').NextConfig} */
const nextConfig = {
	reactStrictMode: true,
	images: {
		remotePatterns: [
			{
				protocol: "https",
				hostname: "editorial.fxstreet.com",
			},
		],
	},
}

const withPWA = require("next-pwa")({
	dest: "public",
	disable: process.env.NODE_ENV === "development",
	runtimeCaching: require("next-pwa/cache"),
})

module.exports = withPWA(nextConfig)
