/** @type {import('next').NextConfig} */
const nextConfig = {
	reactStrictMode: true,
	images: {
		remotePatterns: [
			{
				protocol: "https",
				hostname: "editorial.fxstreet.com",
			}
		]
	}
}

// eslint-disable-next-line @typescript-eslint/no-var-requires
const withPWA = require("next-pwa")({ dest: "public" })

module.exports = withPWA(nextConfig)
