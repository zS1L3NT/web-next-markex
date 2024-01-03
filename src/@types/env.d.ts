declare namespace NodeJS {
	interface ProcessEnv {
		readonly NEXT_PUBLIC_APCA_API_KEY_ID: string
		readonly NEXT_PUBLIC_APCA_API_SECRET_KEY: string
		readonly NEXT_PUBLIC_FINNHUB_API_KEY: string
		readonly NEXT_PUBLIC_OANDA_API_KEY: string
		readonly NEXT_PUBLIC_POSTHOG_KEY: string
		readonly NEXT_PUBLIC_POSTHOG_HOST: string
		readonly DATABASE_URL: string
		readonly GOOGLE__CLIENT_ID: string
		readonly GOOGLE__CLIENT_SECRET: string
		readonly NEXTAUTH__JWT_SECRET: string
	}
}
